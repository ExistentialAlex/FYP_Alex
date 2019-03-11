import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as WordExtractor from 'word-extractor';
import * as textract from 'textract';
import suffixArray from './suffixArray';

// interface Location {
//   lid: string;
//   location_name: string;
//   location_type: string;
//   sentimental_value: number;
// }

// interface Context {
//   lid: string;
//   context_string: string;
//   fid: string;
// }

export const processFile = functions.storage.object().onFinalize(async file => {
  const serviceAccount = require(__dirname + '/../config/serviceAccount.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://fyp-alex.firebaseio.com',
  });

  const firestore = admin.firestore();

  const fileBucket: string = file.bucket;
  const filePath: string = file.name;
  const fileDet: string = path.basename(filePath);
  const fileNameSplit: string[] = fileDet.split('.');
  const fileExt: string = fileNameSplit.pop();
  const fileName: string = fileNameSplit.join('.');
  const bucket = admin.storage().bucket(fileBucket);
  const fileRef = bucket.file(filePath);
  const _path: string = `/tmp/${fileName}.${fileExt}`;
  try {
    await fileRef.download({ destination: _path });
    console.log('File Saved');
    const text = await getText(_path, fileExt);
    console.log(`Text: ${text}`);
    const searchTerms = await getSearchTerms();
    console.log(`Search Terms: ${searchTerms}`);
    console.log('Creating Suffix Array');
    const suffix_array = suffixArray(text);
    for (const searchDoc of searchTerms) {
      const searchTerm = searchDoc.location_name.toLowerCase();
      console.log(searchTerm);
      const matchedIndexes = search(text.toLowerCase(), searchTerm, suffix_array);
      console.log(matchedIndexes);
      console.log(matchedIndexes.length);
      if (matchedIndexes.length > 0) {
        console.log('Creating Contexts');
        const contexts = createContexts(matchedIndexes, searchDoc, text, fileName);
        console.log(contexts);
        const promises = [];
        if (contexts.length > 0) {
          console.log('Adding Contexts to DB');
          for (const context of contexts) {
            const p = admin
              .firestore()
              .collection('FYP_CONTEXTS')
              .add(context);
            promises.push(p);
          }
          await Promise.all(promises);
          console.log('Contexts added to DB');
        } else {
          console.log('No contexts to add');
        }
      }
    }
    const data = {
      processed: 1,
    };
    return firestore.doc(`FYP_FILES/${fileName}`).update(data);
  } catch (e) {
    const failData = {
      processed: 2,
    };
    return firestore
      .doc(`FYP_FILES/${fileName}`)
      .update(failData)
      .catch(e => {
        console.error(e);
      });
  }
});

async function getText(_path: string, fileExt: string) {
  let text: string = '';

  switch (fileExt) {
    case 'docx':
    case 'doc':
      const extractor = new WordExtractor();
      const extracted = await extractor.extract(_path);
      text = extracted.getBody();
      break;
    case 'pdf':
      break;
    case 'txt':
      textract.fromFileWithPath(_path, function(extractedError: any, string: string) {
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
  }
  return text;
}

async function getSearchTerms(): Promise<FirebaseFirestore.DocumentData[]> {
  try {
    const snapshot = await admin
      .firestore()
      .collection('FYP_LOCATIONS')
      .get();
    return snapshot.docs.map(doc => doc.data());
  } catch (e) {
    console.error(e);
    return [];
  }
}

function search(text: string, search_term: string, suffix_array: number[]) {
  const matches = [];
  suffix_array.forEach(index => {
    const substring = text.substring(index, index + search_term.length);
    const match = search_term.localeCompare(substring);

    if (match === 0) {
      matches.push(index);
    }
  });
  return matches;
}

function createContexts(
  matchedIndexes: number[],
  searchDoc: FirebaseFirestore.DocumentData,
  text: string,
  fileName: string
) {
  const contexts = [];
  const searchTerm = searchDoc.location_name.toLowerCase();
  for (const index of matchedIndexes) {
    let left = index - 25;
    let right = index + searchTerm.length + 25;
    if (left < 0) {
      left = 0;
    }
    if (right > text.length) {
      right = text.length;
    }
    const context = text.substring(left, right);
    contexts.push({
      lid: searchDoc.lid,
      context_string: context,
      fid: fileName,
    });
  }
  return contexts;
}

// function search(text: string, searchTerm: string, suffix_array: number[]) {
//   console.log(`Beginning search for: ${searchTerm}`);
//   let start = 0;
//   let end = suffix_array.length - 1;
//   const matchedIndexes: number[] = [];

//   while (start < end) {
//     const mid: number = (end) / 2;
//     const index: number = suffix_array[mid];
//     const finalIndex: number = index + searchTerm.length;
//     if (finalIndex <= text.length) {
//       const substring: string = text.substring(index, finalIndex);
//       const match: number = searchTerm.localeCompare(substring);

//       if (match === 0) {
//         console.log(`Match Found at Index: ${index}`);
//         matchedIndexes.push(index);
//       } else if (match < 0) {
//         end = mid;
//       } else if (match > 0) {
//         start = mid;
//       }
//       console.log(matchedIndexes);
//     }
//   }

//   if (matchedIndexes.length === 0) {
//     console.log(`No matches found for search term: ${searchTerm}`);
//   }

//   return matchedIndexes;
// }
