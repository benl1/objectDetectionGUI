const fs = require('fs');

/**
 * Synchronously read in the given file path and 
 * return the contents of the file at that path.
 * @param {String} path 
 */
function readFile(path) {
    console.log(path)
    return fs.readFileSync(path);
}

export { readFile };