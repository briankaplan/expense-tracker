const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function checkDirectory(dir: string) {
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

function checkFile(filePath: string) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

function readDirectory(dir: string, options?: any) {
  return fs.readdirSync(dir, options);
}

function readFile(path: string) {
  return fs.readFileSync(path, 'utf8');
}

function joinPath(...parts: string[]) {
  return path.join(...parts);
}

module.exports = {
  fs,
  path,
  chalk,
  checkDirectory,
  checkFile,
  readDirectory,
  readFile,
  joinPath
}; 