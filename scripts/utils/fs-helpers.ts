import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

export { chalk };

export function joinPath(...paths: string[]): string {
  return path.join(...paths);
}

export function checkDirectory(dir: string): boolean {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  } catch (error) {
    return false;
  }
}

export function checkFile(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

export function readDirectory(dir: string, options?: fs.ReaddirOptions): string[] {
  try {
    return fs.readdirSync(dir, { ...options, withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name);
  } catch (error) {
    return [];
  }
}

export function readFile(file: string): string {
  return fs.readFileSync(file, 'utf8');
}

export function listFilesRecursively(dir: string): string[] {
  const files: string[] = [];

  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

export function listDirectoriesRecursively(dir: string): string[] {
  const directories: string[] = [];

  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        directories.push(fullPath);
        traverse(fullPath);
      }
    }
  }

  traverse(dir);
  return directories;
}

export function readFileContents(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

export function writeFileContents(filePath: string, contents: string): void {
  fs.writeFileSync(filePath, contents, 'utf-8');
}

export function ensureDirectoryExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function deleteFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function copyFile(source: string, destination: string): void {
  fs.copyFileSync(source, destination);
}

export function moveFile(source: string, destination: string): void {
  fs.renameSync(source, destination);
}

export function getFileStats(filePath: string) {
  return fs.statSync(filePath);
}

export function isDirectory(path: string): boolean {
  try {
    return fs.statSync(path).isDirectory();
  } catch {
    return false;
  }
}

export function isFile(path: string): boolean {
  try {
    return fs.statSync(path).isFile();
  } catch {
    return false;
  }
} 