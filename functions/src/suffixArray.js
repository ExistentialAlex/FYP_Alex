import radixSort from './radix-sort';
import stringToSequence from './string-sequence';

function createSample(block, offset, sequence, length = 3) {
  const suffix = (block * 3) + offset;
  return [suffix, ...sequence.slice(suffix, suffix + length)]; // prefix triplet with suffix
}

function sampleSequence(sequence, terminator) {
  const n = sequence.length;
  const remainder = n % 3;
  const blocks = (n - remainder) / 3;

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

  /* eslint-disable default-case */
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
    // default:
    //   throw Error(`Impossible remainder: ${remainder}`);
  }
  /* eslint-enable default-case */

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

export function sampleToString(sample) {
  // tslint:disable-next-line:no-invalid-this
  return String.fromCharCode.apply(this, sample);
}

// Converts an array of samples to a sequence with each sample's rank.
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

function rankSortedSamples(n, sortedSamples) {
  const r = n % 3;
  const m = n + (r !== 0 ? 3 - r : 0);
  const result = new Array(m);

  let rank = 1;
  sortedSamples.forEach(sample => result[sample[0]] = rank++);

  switch (r) {
    default:
      break;
    case 2:
      result[n + 2] = 0;
      // fall through
    case 1:
      result[n + 1] = 0;
      break;
  }
  return result;
}

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

function merge(sequence, sortedNonSampledPairs, sortedSamples, ranks) {
  const result = [];

  let a = 0;
  let b = 0;
  while (a < sortedNonSampledPairs.length && b < sortedSamples.length) {
    const i = sortedSamples[b][0];
    const j = sortedNonSampledPairs[a][0];
    // if (j % 3 !== 0) {
    //   throw new Error('Sorted non-samples should only contain offset 0 (mod 3) entries');
    // }

    let d = sequence[i] - sequence[j];
    /* eslint-disable default-case */
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
      // default:
      //   throw new Error('Sorted samples should only contain offset != 0 (mod 3) entries');
    }
    /* eslint-enable default-case */

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

function createSuffixArray(sequence, terminator) {
  const n = sequence.length;

  // handle trivial cases
  switch (n) {
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

  const ranks = rankSortedSamples(n, sortedSamples);

  const sortedNonSampledPairs = radixSort(
    createNonSampledPairs(sequence, ranks), entry => entry.slice(1),
  );

  return merge(sequence, sortedNonSampledPairs, sortedSamples, ranks);
}

export function suffixArrayToString(s, sa) {
  const sequence = Array.isArray(s) ? s : stringToSequence(s);
  return ['[']
    .concat(sa.map(i => `  ${i}, // ${sequence.slice(i).map(c => String.fromCharCode(c)).join('')}`))
    .concat(']')
    .join('\n');
}

/**
 * Calculates the suffix array for the given string and an optional terminator code
 * which must be negative.
 *
 * @param {number[]|string} s the string or sequence to compute the suffix array for.
 * @param {number} [terminator=-1] an optional negative terminator code.
 * @return {number[]} a suffix array.
 */
export default function suffixArray(s, terminator = -1) {
  const sequence = Array.isArray(s) ? s : stringToSequence(s);
  const t = terminator != null ? terminator : -1;
  if (typeof t !== 'number') {
    throw TypeError(`the terminator argument is not a number: ${typeof terminator}`);
  }
  if (t > -1) {
    throw Error(`the terminator is not a negative integer: ${terminator}`);
  }

  const result = createSuffixArray(sequence, t);

  return result;
}