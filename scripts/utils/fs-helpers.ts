import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export function checkDirectory(dir: string): boolean {
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

export function checkFile(file: string): boolean {
  return fs.existsSync(file) && fs.statSync(file).isFile();
}

export function readDirectory(dir: string, options?: { withFileTypes: boolean }) {
  return fs.readdirSync(dir, options);
}

export function readFile(file: string): string {
  return fs.readFileSync(file, 'utf8');
}

export function joinPath(...paths: string[]): string {
  return path.join(...paths);
}

export { chalk }; 