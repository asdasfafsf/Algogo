import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  encryptAES(key: string | Buffer, iv: string | Buffer, cipherText: string) {
    if (typeof key === 'string') {
      key = Buffer.from(key, 'base64');
    }

    if (typeof iv === 'string') {
      iv = Buffer.from(iv, 'base64');
    }

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(cipherText, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return encrypted;
  }

  decryptAES(
    key: string | Buffer,
    iv: string | Buffer,
    encryptedText: string,
  ): string {
    if (typeof key === 'string') {
      key = Buffer.from(key, 'base64');
    }

    if (typeof iv === 'string') {
      iv = Buffer.from(iv, 'base64');
    }

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
