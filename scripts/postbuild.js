#!/usr/bin/env node

const { EOL } = require('os');
const { resolve } = require('path');
const { createWriteStream, existsSync, mkdirSync, readFileSync } = require('fs');
const archiver = require('archiver');

const ROOT_DIRECTORY = process.cwd();
const DIRECTORY = 'directory';
const FILE = 'file';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));
const buildDirectory = resolve(ROOT_DIRECTORY, 'build');

if (!existsSync(buildDirectory)) {
  mkdirSync(buildDirectory);
}

const targetZipFile = resolve(ROOT_DIRECTORY, `build/${manifest.version}.zip`);
const output = createWriteStream(targetZipFile);
const archive = archiver('zip');

const filesToZip = [
  {
    path: 'manifest.json',
    type: FILE,
  },
  {
    path: 'icons',
    type: DIRECTORY,
  },
  {
    path: 'packages/popup/dist',
    type: DIRECTORY,
  },
  {
    path: 'packages/content/dist',
    type: DIRECTORY,
  },
  {
    path: 'packages/background/dist',
    type: DIRECTORY,
  },
];

try {
  output.on('close', () => {
    console.info(`${archive.pointer()} total bytes`);
    console.info('files have been archived');
  });

  archive.on('error', (error) => {
    throw error;
  });

  archive.pipe(output);

  for (const file of filesToZip) {
    if (file.type === DIRECTORY) {
      archive.directory(file.path, file.path);
      continue;
    }

    archive.file(file.path, {
      name: file.path,
    });
  }

  const date = new Date();

  const buildInformation = [
    date.toUTCString(),
    `Version: ${manifest.version}`,
  ];

  archive.append(buildInformation.join(EOL), {
    name: '.build',
  });

  archive.finalize();
} catch (error) {
  console.error(error);
  process.exit(1);
}
