/**
 * Converts a string into an array of its corresponding 16-bit character codes.
 * @param {string} s the string to be converted.
 * @return {number[]} an array of 16-bit character codes
 */

export default function stringToSequence(s) {
    if (typeof s !== 'string') {
      throw Error(`Expected a string but got ${typeof s}`);
    }
  
    return s.split('').map(c => c.charCodeAt(0));
  }