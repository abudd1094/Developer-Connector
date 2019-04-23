const isEmpty = value => 
  value === undefined || 
  value === null ||
  (typeof value === 'object' && Object.keys(value).length === 0) || // if value is an empty object
  (typeof value === 'string' && value.trim().length === 0); // if value is an empty string

module.exports = isEmpty;