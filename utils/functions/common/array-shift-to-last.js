/* Shifts a specified element in an array to the lst index.*/
module.exports = (array, callback) => array = array.push(array.splice(array.findIndex(callback), 1)[0]);