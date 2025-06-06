import { Injectable } from '@nestjs/common';
import fs from 'fs/promises';
import path from 'path';
import internal from 'stream';

type FileData =
  | string
  | NodeJS.ArrayBufferView
  | Iterable<string | NodeJS.ArrayBufferView>
  | AsyncIterable<string | NodeJS.ArrayBufferView>
  | internal.Stream;

@Injectable()
export class FileService {
  constructor() {}

  async tmpDir(basePath: string) {
    return await fs.mkdtemp(basePath);
  }

  async writeFile(basePath: string, filePath: string, data: FileData) {
    const fullPath = path.resolve(basePath, filePath);
    await fs.writeFile(fullPath, data);

    return fullPath;
  }

  async readFile(basePath: string, fullPath: string) {
    return await fs.readFile(path.resolve(basePath, fullPath));
  }

  async removeFile(basePath: string, filePath: string) {
    const fullPath = path.join(basePath, filePath);
    await fs.unlink(fullPath);
  }

  async removeDir(basePath: string) {
    await fs.rm(basePath, {
      force: true,
      recursive: true,
    });
  }
}
