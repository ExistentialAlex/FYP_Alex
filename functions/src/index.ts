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

  console.log('Getting Download URL');
  try {
    const fileDet = path.basename(filePath);
    const fileNameSplit = fileDet.split('.');
    const fileExt = fileNameSplit.pop();
    const fileName = fileNameSplit.join('.');
    const bucket = admin.storage().bucket(fileBucket);
    const fileRef = bucket.file(filePath);

    const _path = `/tmp/${fileName}.${fileExt}`;
    console.log(`Downloading to: ${_path}`);
    await fileRef.download({ destination: _path });
    console.log('File Saved');
    doProcess(file, _path);
  } catch (e) {
    console.error(e);
  }
});

function doProcess(file, publicUrl?: string) {
  console.log(`Getting Details: ${publicUrl}`);
  const filePath = file.name;
  const fileDet = path.basename(filePath);
  const fileNameSplit = fileDet.split('.');
  const fileExt = fileNameSplit.pop();
  const fileName = fileNameSplit.join('.');

  switch (fileExt) {
    case 'docx':
    case 'doc':
      const WordExtractor = require('word-extractor');
      const extractor = new WordExtractor();
      const extracted = extractor.extract(publicUrl);
      extracted.then(async function(document) {
        const documentBody: string = document.getBody();
        console.log(documentBody);
        await fileProcessing(documentBody, fileName);
      });
      break;
    case 'pdf':
      break;
    case 'txt':
      const textract = require('textract');
      textract.fromFileWithPath(publicUrl, async function(
        extractedError,
        text
      ) {
        if (extractedError) {
          console.error(extractedError);
        }
        if (text !== null) {
          await fileProcessing(text, fileName);
        }
      });
      break;
    default:
      console.log('Unsupported File Type');
      return null;
  }

  const data = {
    processed: 1
  };
  admin
    .firestore()
    .doc('FYP_FILES/' + fileName)
    .update(data)
    .then(doc => {
      console.log('Document Processed:' + fileName);
    })
    .catch(error => {
      console.error(error);
    });
}

async function fileProcessing(text, fileName) {
  console.log(`Processing: ${fileName}`);
  console.log('Creating Suffix Array');
  const suffix_array = suffixArray(text);
  console.log(`Suffix Array Created: ${suffix_array}`);
  const searchPatterns = admin
      .firestore()
      .collection('FYP_LOCATIONS')
      .get();
  const contexts = await createContexts(text, suffix_array, fileName, searchPatterns);
  contexts.forEach(async (context: Context) => {
    try {
      const contextDoc = await admin
        .firestore()
        .collection('FYP_CONTEXTS')
        .add(context);
      console.log(`Context Added: ${contextDoc}`);
    } catch (error) {
      console.error(error);
    }
  });
}

async function createContexts(
  string: string,
  suffix_array: Array<number>,
  fileName: string,
  searchPatterns
): Promise<Array<Context>> {
  const contexts: Array<Context> = [];
  console.log('Creating Contexts');
  console.log('Getting Search Patterns');
  try {
    await searchPatterns;
    console.log('Search Patterns Received');
    for (let i = 0; searchPatterns.length; i++) {
      const patternDoc = searchPatterns.docs[i].data();
      const pattern: string = patternDoc.location_name.toLowerCase();
      const indexPatterns = binarySearch(
        pattern,
        string.toLowerCase(),
        suffix_array
      );
      for (const index of indexPatterns) {
        let left = index - 25;
        let right = index + patternDoc.location_name.length + 25;
        if (left < 0) {
          left = 0;
        }
        if (right > string.length) {
          right = string.length;
        }
        const context = string.substring(left, right);
        contexts.push({
          lid: patternDoc.lid,
          context_string: context,
          fid: fileName
        });
      }
    }
    return contexts;
  } catch (error) {
    console.error(error);
    return contexts;
  }
}

function binarySearch(
  pattern: string,
  string: string,
  suffix_array: Array<number>
): Array<number> {
  console.log(`Beginning search for: ${pattern}`);
  let start = 0;
  let end = suffix_array.length;
  const matchedIndexes: Array<number> = [];

  while (start < end) {
    const mid: number = (end - 1) / 2;
    const index: number = suffix_array[mid];
    const finalIndex: number = index + pattern.length;
    if (finalIndex <= string.length) {
      const substring: string = string.substring(index, finalIndex);
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

  return matchedIndexes;
}
