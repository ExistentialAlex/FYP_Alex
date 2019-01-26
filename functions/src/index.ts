import functions = require("firebase-functions");
import admin = require("firebase-admin");
import path = require("path");

interface suffix {
  index: number;
  rank: Array<number>[2];
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

export const processFile = functions.storage.object().onFinalize(file => {
  const filePath = file.name;
  const fileDet = path.basename(filePath);
  const fileName = fileDet.split('.')[0]
  const fileExt = fileDet.split('.')[1];

  console.log(filePath);
  console.log(fileName);
  console.log(fileExt);

  admin.initializeApp();

  switch (fileExt) {
    case 'docx':
    case 'doc':
      const WordExtractor = require('word-extractor');
      const extractor = new WordExtractor();
      const extracted = extractor.extract(filePath);
      extracted.then(function(document) {
        const suffixArray = generateSuffixArray(document, document.length);
        const contexts = createContexts(document, suffixArray, fileName);
        contexts.forEach((context: Context) => {
            admin.firestore().collection('FYP_CONTEXTS').add(context).then(contextDoc => {
                console.log('Context Added:' + contextDoc);
            }).catch(error => {
                console.error(error);
            });
        })
      });
      break;
    case 'pdf':
      break;
    case 'txt':
      break;
    default:
      console.log('Unsupported File Type');
      return null;
  }
  const data = {
      processed: 1
  }
  admin.firestore().doc('FYP_FILES/' + fileName).update(data).then(doc => {
      console.log('Docment Processed:' + doc);
  }).catch(error => {
      console.error(error);
  })
});

function createContexts(string, suffixArray, fileName): Array<Context> {
    console.log('Creating Contexts');
    const searchPatterns = admin
    .firestore()
    .collection('FYP_LOCATIONS')
    .get();
    const contexts = [];
    
    searchPatterns.then(locations => {
        for (let i = 0; i < locations.size; i++) {
          const locationDoc = locations.docs[i].data();
          const indexLocations = binarySearch(
            locationDoc.location_name,
            string,
            suffixArray,
            string.length
          );
          for (const index of indexLocations) {
            let left = index - 25;
            const right = index + locationDoc.location_name.length + 25;
            if (left < 0) {
              left = 0;
            }
            const context = string.substr(left, right);
            contexts.push({
              lid: locationDoc.lid,
              context_string: context,
              fid: fileName
            });
          }
        }
      }).catch(error => {
          console.error(error);
      });
      return contexts;
}

function generateSuffixArray(string, strLength): Array<any> {
  console.log('Generating Suffixes');
  const suffixes = new Array<suffix>(strLength);
  const ind = new Array(strLength);

  for (let i = 0; i < strLength; i++) {
    suffixes[i].index = i;
    suffixes[i].rank[0] = string[i];
    suffixes[i].rank[1] = i + 1 < strLength ? string[i + 1] : -1;
  }

  suffixes.sort(sortSuffixes());

  for (let k = 4; k < 2 * strLength; k = k * 2) {
    let rank = 0;
    let prevRank = suffixes[0].rank[0];
    suffixes[0].rank[0] = rank;
    ind[suffixes[0].index] = 0;

    for (let i = 1; i < strLength; i++) {
      if (
        suffixes[i].rank[0] === prevRank &&
        suffixes[i].rank[1] === suffixes[i - 1].rank[1]
      ) {
        prevRank = suffixes[i].rank[0];
        suffixes[i].rank[0] = rank;
      } else {
        prevRank = suffixes[i].rank[0];
        suffixes[i].rank[0] = ++rank;
      }
      ind[suffixes[i].index] = i;
    }

    for (let i = 0; i < strLength; i++) {
      const nextIndex = suffixes[i].index + k / 2;
      suffixes[i].rank[1] =
        nextIndex < strLength ? suffixes[ind[nextIndex]].rank[0] : -1;
    }

    suffixes.sort(sortSuffixes());
  }

  const suffixArray = new Array(strLength);

  for (let i = 0; i < strLength; i++) {
    suffixArray[i] = suffixes[i].index;
  }

  return suffixArray;
}

function sortSuffixes(): (a: suffix, b: suffix) => number {
    return function (a, b) {
        return a.rank[0] === b.rank[0]
            ? a.rank[1] < b.rank[1]
                ? 1
                : 0
            : a.rank[0] < b.rank[0]
                ? 1
                : 0;
    };
}

function binarySearch(
  pattern: string,
  string: string,
  suffixArray: Array<number>,
  strLength: number
): Array<number> {
  let l = 0;
  let r = strLength - 1;

  const found = [];

  while (l <= r) {
    const mid = l + (r - l) / 2;
    const res = pattern.localeCompare(string + suffixArray[mid]);

    if (res === 0) {
      found.push(suffixArray[mid]);
    } else if (res > 0) {
      l = mid + 1;
    } else {
      r = mid - 1;
    }
  }

  if (!Array.isArray(found) || !found.length) {
    console.log('No Words Found');
  }

  return found;
}
