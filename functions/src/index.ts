import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as WordExtractor from 'word-extractor';
import * as textract from 'textract';
import * as sentiment from 'sentiment';

// Context Interface, allows interaction with Context objects.
interface Context {
  stid: string;
  cid: string;
  context_string: string;
  fid: string;
  sentimental_value: number;
}

// SearchTerm interface, allows interaction with search term objects.
interface SearchTerm {
  searchTerm: string;
  Id: number;
}

// Firebase service account required to use functions.
const serviceAccount = require(__dirname + '/../config/serviceAccount.json');

// Initialise the Firebase Cloud Function.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fyp-alex.firebaseio.com',
});

/**
 * The main file processing function.
 * Executed when a file has finished uploading to Firebase Storage.
 */
export const processFile = functions.storage.object().onFinalize(async file => {
  // Create a firestore object to improve code reuse.
  const firestore = admin.firestore();

  // Initialise all of the variables needed to save and extract the text from the file.
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
    // Download the file to a temporary folder so that it can be accessed.
    await fileRef.download({ destination: _path });
    console.log('File Saved');
    // Extract the text from the file.
    const text = await getText(_path, fileExt);
    console.log(`Text Extracted`);
    console.log('Creating Suffix Array');
    // Create a suffix array from the extracted text.
    const suffix_array = suffixArray(text);
    console.log(suffix_array);
    console.log('Suffix Array Created');
    // Retrieve the search terms for the file from Firestore.
    const search_document = await getSearchTerms(fileName);
    const search_terms: SearchTerm[] = search_document.searchTerms;
    console.log(`Search Terms: ${search_terms}`);
    for (const searchObj of search_terms) {
      const search_term = searchObj.searchTerm.toLowerCase();
      console.log(search_term);
      // Search for the search term in the text using the suffix array.
      const matched_indexes = search(text.toLowerCase(), search_term, suffix_array);
      console.log(matched_indexes);
      console.log(matched_indexes.length);
      if (matched_indexes.length > 0) {
        console.log('Creating Contexts');
        // For Each of the matched indexes, create contexts using the text and search terms.
        const contexts: Context[] = createContexts(matched_indexes, search_term, text, fileName);
        console.log(contexts);
        const promises = [];
        if (contexts.length > 0) {
          // Add each context to the database.
          console.log('Adding Contexts to DB');
          for (const context of contexts) {
            const p = admin
              .firestore()
              .doc(`FYP_CONTEXTS/${context.cid}`)
              .set(context);
            promises.push(p);
          }
          // Wait for all of the uploads to resolve.
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
    // Update the files Firestore document to show that it has been processed.
    return firestore.doc(`FYP_FILES/${fileName}`).update(data);
  } catch (e) {
    console.error(e);
    const failData = {
      processed: 2,
    };
    // Update the files Firestore document to show that it failed.
    return firestore
      .doc(`FYP_FILES/${fileName}`)
      .update(failData)
      .catch(e => {
        console.error(e);
      });
  }
});

/**
 * Extracts the text for a given file based on the file extension used.
 *
 * @param _path - The path to the file for processing.
 * @param fileExt - The file extension of the file to process.
 * @returns The extracted text as a string.
 */
async function getText(_path: string, fileExt: string): Promise<string> {
  let text: string = '';

  switch (fileExt) {
    case 'docx':
      textract.fromFileWithPath(_path, function(extractedError: string, extractedText: string) {
        if (extractedError) {
          console.error(extractedError);
        }
        text = extractedText;
      });
      break;
    case 'doc':
      const extractor = new WordExtractor();
      const extracted = await extractor.extract(_path);
      text = extracted.getBody();
      break;
    case 'txt':
      textract.fromFileWithPath(_path, function(extractedError: string, extractedText: string) {
        if (extractedError) {
          console.error(extractedError);
        }
        console.log(extractedText);
        text = extractedText;
      });
      break;
    default:
      console.log('Unsupported File Type');
  }
  return text;
}

/**
 * Retrieves the search terms for the file being processed.
 *
 * @param fileName - The file name to retrieve the search terms for.
 * @returns The Search Terms from Firebase as a promise.
 */
async function getSearchTerms(fileName: string): Promise<FirebaseFirestore.DocumentData> {
  try {
    const snapshot = await admin
      .firestore()
      .doc(`FYP_FILES/${fileName}`)
      .get();
    return snapshot.data();
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Searches for a search term in a string using a suffix array.
 *
 * @param text - The extracted text to search through.
 * @param search_term - The search term to search for.
 * @param suffix_array - The suffix array of the extracted text.
 * @returns The indexes where the search term was found.
 */
function search(text: string, search_term: string, suffix_array: number[]): number[] {
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

/**
 * Creates the contexts for the search term.
 * These are created by using the matched indexes and expanding from them in the text.
 *
 * @param matchedIndexes - The indexes where the search term was found.
 * @param searchTerm - The search term that was searched for.
 * @param text - The extracted text that the term was found in.
 * @param fileName - The name of the file the text was extracted from.
 * @returns The array of contexts for the search term.
 */
function createContexts(
  matchedIndexes: number[],
  searchTerm: string,
  text: string,
  fileName: string
): Context[] {
  const contexts = [];
  let contextCounter = 1;
  for (const index of matchedIndexes) {
    let left: number = index - 25;
    let right: number = index + searchTerm.length + 25;
    if (left < 0) {
      left = 0;
    }
    if (right > text.length) {
      right = text.length;
    }
    const context = text.substring(left, right);
    const sentimentalValue: number = analyse(context);
    const stid = `${fileName}_${searchTerm}`.replace(/\s/g, '');
    const cid = `${stid}_${contextCounter}`;
    contexts.push({
      searchTerm: searchTerm,
      context_string: context,
      fid: fileName,
      cid: cid,
      stid: stid,
      sentimental_value: parseFloat(sentimentalValue.toFixed(3)),
    });
    contextCounter++;
  }
  return contexts;
}

/**
 * Analyses a context using sentiment analysis.
 *
 * @param context - Context to analyse.
 * @returns The comparitive sentiment value.
 */
function analyse(context: string): number {
  const sentimental = new sentiment();
  const result = sentimental.analyze(context);
  console.log(result);
  return result.comparative;
}

/**
 * Searches for a search term in the extracted text using the suffix array to speed up the search.
 *
 * @param text - The extracted text to search.
 * @param searchTerm - The search term to search for.
 * @param suffix_array - The suffix array for the extracted text.
 * @returns An array of indexes where the search term was found.
 */
function binarySearch(text: string, searchTerm: string, suffix_array: number[]): number[] {
  let left = 0;
  let right = text.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const index = suffix_array[mid];
    const comparisonString = text.substring(index, index + searchTerm.length);
    const found = searchTerm.localeCompare(comparisonString);

    if (found < 0) {
      right = mid - 1;
    } else if (found > 0) {
      left = mid + 1;
    } else {
      const lower_bound = lowerBound(text, searchTerm, suffix_array, mid);
      const upper_bound = upperBound(text, searchTerm, suffix_array, mid);

      console.log(lower_bound);
      console.log(upper_bound);

      return suffix_array.slice(lower_bound + 1, upper_bound);
    }
  }
  return [];
}

/**
 * Finds the lower bound of matching indexes from 
 * the text, search term, suffix array and the first matching index found.
 *
 * @param text - The extracted text.
 * @param searchTerm - The search term to search for.
 * @param suffix_array - The suffix array of the extracted text.
 * @param matchedIndex - The index where a match is found.
 * @returns The lower bound of the matched indexes.
 */
function lowerBound(
  text: string,
  searchTerm: string,
  suffix_array: number[],
  matchedIndex: number
) {
  let found = true;
  let index = matchedIndex;

  while (found) {
    const suffix_index = suffix_array[index];
    const compareString = text.substring(suffix_index, suffix_index + searchTerm.length);
    const match = searchTerm.localeCompare(compareString);

    if (match === 0) {
      index = index - 1;
    } else {
      found = false;
    }
  }

  return index;
}

/**
 * Finds the upper bound of matching indexes from 
 * the text, search term, suffix array and the first matching index found.
 *
 * @param text - The extracted text.
 * @param searchTerm - The search term to search for.
 * @param suffix_array - The suffix array of the extracted text.
 * @param matchedIndex - The index where a match is found.
 * @returns The upper bound of the matched indexes.
 */
function upperBound(
  text: string,
  searchTerm: string,
  suffix_array: number[],
  matchedIndex: number
) {
  let found = true;
  let index = matchedIndex;

  while (found) {
    const suffix_index = suffix_array[index];
    const compareString = text.substring(suffix_index, suffix_index + searchTerm.length);
    const match = searchTerm.localeCompare(compareString);

    if (match === 0) {
      index = index + 1;
    } else {
      found = false;
    }
  }

  return index;
}

/**
 * Creates a sample from a sequence, used to help sort the sequence.
 *
 * @param block - The current block to create the sample from.
 * @param offset - Value to offset the sample by.
 * @param sequence - The sequence of the text.
 * @param length - Size of the difference cover, set to 3 if not specified.
 * @returns The created sample.
 */
function createSample(block, offset, sequence, length = 3) {
  const suffix = (block * 3) + offset;
  return [suffix, ...sequence.slice(suffix, suffix + length)]; // prefix triplet with suffix
}

/**
 * Creates an array of samples from a sequence which are used to sort the sequence.
 *
 * @param sequence - The sequence to create the sample from.
 * @param terminator - Terminator value.
 * @returns The sample of the sequence.
 */
function sampleSequence(sequence, terminator): any[] {
  const sequenceLength = sequence.length;
  const remainder = sequenceLength % 3;
  const blocks = (sequenceLength - remainder) / 3;

  const b1 = [];
  const b2 = [];

  let i = 0;
  while (i < blocks - 1) {
    b1.push(createSample(i, 1, sequence));
    b2.push(createSample(i, 2, sequence));
    i++;
  }

  let lastB1 = createSample(i, 1, sequence, 2);
  const lastB2 = createSample(i, 2, sequence, 1);

  i++;

  switch (remainder) {
    case 2:
      lastB1.push(sequence[i * 3]);
      b1.push(lastB1);
      lastB1 = [(i * 3) + 1];
      lastB2.push(sequence[i * 3]);
      break;
    case 1:
      lastB1.push(sequence[i * 3]);
      lastB2.push(sequence[i * 3]);
      break;
    case 0:
      break;
  }

  while (lastB1.length % 4 !== 0) {
    lastB1.push(terminator);
  }

  while (lastB2.length % 4 !== 0) {
    lastB2.push(terminator);
  }

  b1.push(lastB1);
  b2.push(lastB2);

  return b1.concat(b2);
}

/**
 * Converts a sample into a string.
 *
 * @param sample - The sample to be converted.
 * @returns The converted sample.
 */
export function sampleToString(sample): string {
  // tslint:disable-next-line:no-invalid-this
  return String.fromCharCode.apply(this, sample);
}

/**
 * Converts an array of samples to a sequence with each sample's rank.
 *
 * @param unsorted - The remaining unsorted samples.
 * @param sorted - The currently sorted samples.
 * @returns The converted sample.
 */
function samplesToSequence(unsorted, sorted) {
  // rank sorted samples
  const sampleToRank = {};
  let rank = 0x21; // !
  let unique = true;
  for (const sample of sorted) {
    const sampleString = sampleToString(sample.slice(1));
    if (sampleString in sampleToRank) {
      unique = false;
    } else {
      sampleToRank[sampleString] = rank++;
    }
  }

  if (unique) {
    return { unique: true };
  }

  // construct new sequence based on the unsorted samples and their ranks
  const samplesSequence = unsorted.map(
    sample => sampleToRank[sampleToString(sample.slice(1))],
  );

  return { unique: false, samplesSequence };
}

/**
 * Provide a rank to each sorted sample to allow for the 
 * remaining unsorted samples to be sorted using the sorted array of samples.
 *
 * @param n - Length of the sequence to be sorted.
 * @param sortedSamples - An array of sorted samples.
 * @returns The resultant ranked array.
 */
function rankSortedSamples(sequenceLength, sortedSamples): any[] {
  const r = sequenceLength % 3;
  const m = sequenceLength + (r !== 0 ? 3 - r : 0);
  const result = new Array(m);

  let rank = 1;
  sortedSamples.forEach(sample => result[sample[0]] = rank++);

  switch (r) {
    default:
      break;
    case 2:
      result[sequenceLength + 2] = 0;
      // fall through
    case 1:
      result[sequenceLength + 1] = 0;
      break;
  }
  return result;
}

/**
 * Creates an array of non-sampled pairs to use for sorting.
 *
 * @param sequence - Sequence to create sampled pairs from.
 * @param ranks - The ranks to assign to the pairs.
 */
function createNonSampledPairs(sequence, ranks) {
  const n = sequence.length;

  const nonSampledPairs = [];

  let i = 0;
  while (i < n) {
    nonSampledPairs.push([i, sequence[i], ranks[i + 1]]);
    i += 3;
  }

  return nonSampledPairs;
}

/**
 * Merges the non-sampled and sampled pairs into one array.
 *
 * @param sequence - The sequence to create the suffix array from.
 * @param sortedNonSampledPairs - An array of sorted non-sampled pairs.
 * @param sortedSamples - An array of sorted sampled pairs.
 * @param ranks - A list of ranks used to sort the sequence.
 * @returns The merged sorted sequence.
 */
function merge(sequence, sortedNonSampledPairs, sortedSamples, ranks): any[] {
  const result = [];

  let a = 0;
  let b = 0;
  while (a < sortedNonSampledPairs.length && b < sortedSamples.length) {
    const i = sortedSamples[b][0];
    const j = sortedNonSampledPairs[a][0];

    let d = sequence[i] - sequence[j];
    switch (i % 3) {
      case 1:
        if (d === 0) {
          d = ranks[i + 1] - ranks[j + 1];
        }
        break;
      case 2:
        if (d === 0) {
          d = sequence[i + 1] - sequence[j + 1];
          if (d === 0) {
            d = ranks[i + 2] - ranks[j + 2];
          }
        }
        break;
    }

    if (d <= 0) {
      result.push(i);
      b++;
    } else {
      result.push(j);
      a++;
    }
  }

  while (b < sortedSamples.length) {
    result.push(sortedSamples[b++][0]);
  }

  while (a < sortedNonSampledPairs.length) {
    result.push(sortedNonSampledPairs[a++][0]);
  }

  return result;
}

/**
 * Create a suffix array for a given sequence.
 *
 * @param sequence - The sequence to create a suffix array from.
 * @param terminator - The terminator function for creating the suffix array.
 * @returns The created suffix array.
 */
function createSuffixArray(sequence, terminator): number[] {
  const sequenceLength = sequence.length;

  // handle trivial cases
  switch (sequenceLength) {
    case 0: return [0];
    case 1: return [1, 0];
    case 2: return sequence[0] < sequence[1] ? [2, 0, 1] : [2, 1, 0];
    default:
      // tslint:disable-next-line:no-parameter-reassignment
      sequence = [...sequence, terminator]; // add terminator to copy of sequence
      break;
  }

  // calculate the set C = B1 u B2
  const sampledPositions = sampleSequence(sequence, terminator);

  let sortedSamples = radixSort(sampledPositions, entry => entry.slice(1));
  const { unique, samplesSequence } = samplesToSequence(sampledPositions, sortedSamples);
  if (!unique) {
    const recursiveSuffixArray = createSuffixArray(samplesSequence, -1);

    sortedSamples = recursiveSuffixArray.map(suffix => sampledPositions[suffix]);
    sortedSamples = sortedSamples.slice(1);
  }

  const ranks = rankSortedSamples(sequenceLength, sortedSamples);

  const sortedNonSampledPairs = radixSort(
    createNonSampledPairs(sequence, ranks), entry => entry.slice(1),
  );

  return merge(sequence, sortedNonSampledPairs, sortedSamples, ranks);
}

/**
 * A call function used in creating the suffix array.
 *
 * @param s - String or sequence to create the suffix array from.
 * @param terminator - A terminator value used in creating the suffix array.
 * @returns The suffix array for a string or sequence.
 */
function suffixArray(s, terminator = -1): number[] {
  const sequence = Array.isArray(s) ? s : stringToSequence(s);
  const t = terminator !== null ? terminator : -1;
  if (typeof t !== 'number') {
    throw TypeError(`the terminator argument is not a number: ${typeof terminator}`);
  }
  if (t > -1) {
    throw Error(`the terminator is not a negative integer: ${terminator}`);
  }

  const result = createSuffixArray(sequence, t);

  return result;
}

/**
 * Sorts the sequences into lexicographical order.
 *
 * @param entries - An array of entries to be sorted.
 * @param getEntry - Retrieves the entry at a point in the array.
 * @returns The sorted entries.
 */
function radixSort(entries, getEntry = entry => entry): number[] {
  if (entries.length < 2) {
    return entries;
  }

  // @ts-ignore
  const n = getEntry(entries[0], 0, entries).length;

  // sort from least significant to most significant digit
  for (let i = 0; i < n; i++) {
    const buckets = {};

    let smallest = 0;
    let largest = -1;

    for (let j = 0; j < entries.length; j++) {
      const e = entries[j];
      // @ts-ignore
      const entry = getEntry(e, j, entries);
      if (entry.length < n) {
        throw Error(`Entry is not of length ${n}: ${entry}`);
      }

      // default undefined and null to 0
      const key = entry[entry.length - i - 1] !== null ? entry[entry.length - i - 1] : 0;
      if (key < smallest) {
        smallest = key;
      }
      if (key > largest) {
        largest = key;
      }
      if (key in buckets) {
        buckets[key].push(e);
      } else {
        buckets[key] = [e];
      }
    }

    // tslint:disable-next-line:no-parameter-reassignment
    entries = [];
    for (let k = smallest; k <= largest; k++) {
      if (k in buckets) {
        // tslint:disable-next-line:no-parameter-reassignment
        entries = entries.concat(buckets[k]);
      }
    }
  }

  return entries;
}

/**
 * Converts a string into a sequence.
 *
 * @param s - The string to convert.
 * @returns The converted String.
 */
function stringToSequence(s) {
  if (typeof s !== 'string') {
    throw Error(`Expected a string but got ${typeof s}`);
  }

  return s.split('').map(c => c.charCodeAt(0));
}
