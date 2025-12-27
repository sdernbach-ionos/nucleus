/* utils.js -- Utility functions to replace lodash
 *
 * Copyright (C) 2024 
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Get a value from an object using dot notation path
 * Replacement for _.get()
 * 
 * @param {object} obj - The object to query
 * @param {string} path - The path to the property (dot notation)
 * @param {*} defaultValue - The value to return if the path doesn't exist
 * @returns {*} The value at the path or defaultValue
 */
export function get(obj, path, defaultValue = undefined) {
  if (!obj || typeof path !== 'string') {
    return defaultValue;
  }

  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined || !(key in result)) {
      return defaultValue;
    }
    result = result[key];
  }

  return result;
}

/**
 * Set a value in an object using dot notation path
 * Replacement for _.set()
 * 
 * @param {object} obj - The object to modify
 * @param {string} path - The path to the property (dot notation)
 * @param {*} value - The value to set
 * @returns {object} The modified object
 */
export function set(obj, path, value) {
  if (!obj || typeof path !== 'string') {
    return obj;
  }

  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;

  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
  return obj;
}
