import functions = require('firebase-functions');
import admin = require('firebase-admin');
import path = require('path');
import suffixArray from './suffixArray';

interface suffix {
  index: number;
  rank: Array<any>;
}

interface Location {
  lid: string;
  location_name: string;
  location_type: string;
  sentimental_value: number;
}

interface Context {
  lid: string;
  context_string: string;
  fid: string;
}

export const processFile = functions.storage.object().onFinalize(async file => {
  const fileBucket = file.bucket;
  const filePath = file.name;

  console.log(`File path ${filePath}`);

  const serviceAccount = require(__dirname + '/../config/serviceAccount.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://fyp-alex.firebaseio.com'
  });

  const firestore = admin.firestore();
  const settings = { timestampsInSnapshots: true };
  firestore.settings(settings);

  const fileDet = path.basename(filePath);
  const fileNameSplit = fileDet.split('.');
  const fileExt = fileNameSplit.pop();
  const fileName = fileNameSplit.join('.');
  const bucket = admin.storage().bucket(fileBucket);
  const fileRef = bucket.file(filePath);
  const searchTerms = file.metadata.searchTerms.split(', ');
  let _path = '';
  console.log('Getting Download URL');
  try {
    _path = `/tmp/${fileName}.${fileExt}`;
    console.log(`Downloading to: ${_path}`);
    await fileRef.download({ destination: _path });
    console.log('File Saved');
  } catch (e) {
    console.error(e);
  }
  console.log(`Getting Details: ${_path}`);
  let text: string = '';

  switch (fileExt) {
    case 'docx':
    case 'doc':
      const WordExtractor = require('word-extractor');
      const extractor = new WordExtractor();
      const extracted = await extractor.extract(_path);
      text = extracted.getBody();
      break;
    case 'pdf':
      break;
    case 'txt':
      const textract = require('textract');
      textract.fromFileWithPath(_path, function(extractedError, string) {
        if (extractedError) {
          console.error(extractedError);
        }
        if (string !== null) {
          text = string;
        }
      });
      break;
    default:
      console.log('Unsupported File Type');
      return null;
  }
  console.log(`Processing: ${fileName}`);
  console.log('Creating Suffix Array');
  const suffix_array = suffixArray(text);
  console.log(`Suffix Array Created: ${suffix_array}`);
  console.log('Getting Search Patterns');
  let searchPatterns;
  try {
    searchPatterns = await admin
      .firestore()
      .collection('FYP_LOCATIONS')
      .get();
    } catch (error) {
      console.error(error);
    }
    console.log(`Search Patterns Received: ${searchPatterns}`);
    const contexts: Array<Context> = [];
    console.log('Creating Contexts');
    for (const searchPattern of searchPatterns.docs) {
      const patternDoc = searchPattern.data();
      const pattern: string = patternDoc.location_name.toLowerCase();
      console.log(pattern);
      console.log(`Beginning search for: ${pattern}`);
      let start = 0;
      let end = suffix_array.length;
      const matchedIndexes: Array<number> = [];

      while (start < end) {
        const mid: number = (end - 1) / 2;
        const index: number = suffix_array[mid];
        const finalIndex: number = index + pattern.length;
        if (finalIndex <= text.length) {
          const substring: string = text.substring(index, finalIndex);
          const match: number = pattern.localeCompare(substring);

          if (match === 0) {
            console.log(`Match Found at Index: ${index}`);
            matchedIndexes.push(index);
          } else if (match < 0) {
            end = mid;
          } else if (match > 0) {
            start = mid;
          }
          console.log(matchedIndexes);
        }
      }

      if (matchedIndexes.length === 0) {
        console.log(`No matches found for search term: ${pattern}`);
      }
      for (const index of matchedIndexes) {
        let left = index - 25;
        let right = index + patternDoc.location_name.length + 25;
        if (left < 0) {
          left = 0;
        }
        if (right > text.length) {
          right = text.length;
        }
        const context = text.substring(left, right);
        contexts.push({
          lid: patternDoc.lid,
          context_string: context,
          fid: fileName
        });
      }
    }
    for (const context of contexts) {
      admin
        .firestore()
        .collection('FYP_CONTEXTS')
        .add(context)
        .then(contextDoc => {
          console.log(`Context Added: ${contextDoc}`);
        })
        .catch(error => {
          console.error(error);
        });
    }
  const data = {
    processed: 1
  };
  return admin
    .firestore()
    .doc('FYP_FILES/' + fileName)
    .update(data);
});
