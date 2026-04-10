import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    service = new CryptoService();
  });

  describe('encryptAES / decryptAES', () => {
    const key = Buffer.from('0123456789abcdef0123456789abcdef').toString('base64');
    const iv = Buffer.from('0123456789abcdef').toString('base64');

    it('암호화 후 복호화하면 원문이 복원된다', () => {
      // Given
      const plaintext = '테스트 데이터';

      // When
      const encrypted = service.encryptAES(key, iv, plaintext);
      const decrypted = service.decryptAES(key, iv, encrypted);

      // Then
      expect(decrypted).toBe(plaintext);
    });

    it('Buffer 타입 키/iv도 동작한다', () => {
      // Given
      const keyBuf = Buffer.from(key, 'base64');
      const ivBuf = Buffer.from(iv, 'base64');

      // When
      const encrypted = service.encryptAES(keyBuf, ivBuf, 'hello');
      const decrypted = service.decryptAES(keyBuf, ivBuf, encrypted);

      // Then
      expect(decrypted).toBe('hello');
    });
  });

  describe('SHA256', () => {
    it('동일 입력에 동일 해시를 반환한다', () => {
      // When
      const hash1 = service.SHA256('test');
      const hash2 = service.SHA256('test');

      // Then
      expect(hash1).toBe(hash2);
    });

    it('다른 입력에 다른 해시를 반환한다', () => {
      // When
      const hash1 = service.SHA256('test1');
      const hash2 = service.SHA256('test2');

      // Then
      expect(hash1).not.toBe(hash2);
    });

    it('반복 횟수를 지정하면 여러 번 해시한다', () => {
      // When
      const singleHash = service.SHA256('test', 1);
      const doubleHash = service.SHA256('test', 2);

      // Then
      expect(singleHash).not.toBe(doubleHash);
      expect(service.SHA256(singleHash, 1)).toBe(doubleHash);
    });
  });
});
