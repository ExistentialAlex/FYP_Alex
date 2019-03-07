/**
 * Radix sorts an array of entries. If getEntry is not given, then entries is assumed to contain
 * an array of arrays where each sub-array is of the same length. If getEntry is given, then the
 * entries may be of any type, but getEntry must return an array corresponding to each entry.
 * 
 * @param {Array.<number[]>} entries an array of entries to be radix sorted.
 * @param {function} [getEntry] an optional function for retrieving each entry.
 * @return the sorted entries.
 */

export default function radixSort(entries, getEntry = entry => entry) {
    if (entries.length < 2) {
      return entries;
    }
  
    const n = getEntry(entries[0], 0, entries).length;
  
    // sort from least significant to most significant digit
    for (let i = 0; i < n; i++) {
      const buckets = {};
  
      let smallest = 0;
      let largest = -1;
  
      for (let j = 0; j < entries.length; j++) {
        const e = entries[j];
        const entry = getEntry(e, j, entries);
        if (entry.length < n) {
          throw Error(`Entry is not of length ${n}: ${entry}`);
        }
  
        // default undefined and null to 0
        const key = entry[entry.length - i - 1] != null ? entry[entry.length - i - 1] : 0;
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
  
      entries = [];
      for (let k = smallest; k <= largest; k++) {
        if (k in buckets) {
          entries = entries.concat(buckets[k]);
        }
      }
    }
  
    return entries;
  }