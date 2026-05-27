import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, CryptoGuardianError } from './cipher.js';
describe('Crypto Guardian Cipher (AES-256-GCM)', () => {
    const secretPhrase = 'super_secret_master_password_123!';
    const plainText = '{"db_host": "localhost", "db_pass": "admin123"}';
    it('should encrypt and correctly format the cipher text', () => {
        const cipherText = encrypt(plainText, secretPhrase);
        const parts = cipherText.split(':');
        expect(parts.length).toBe(4); // salt:iv:tag:text
        expect(parts[0]).toBeDefined(); // salt
        expect(parts[1]).toBeDefined(); // iv
        expect(parts[2]).toBeDefined(); // authTag
        expect(parts[3]).toBeDefined(); // encryptedHex
    });
    it('should successfully decrypt with the correct phrase', () => {
        const cipherText = encrypt(plainText, secretPhrase);
        const decrypted = decrypt(cipherText, secretPhrase);
        expect(decrypted).toBe(plainText);
    });
    it('should throw an error with an incorrect phrase', () => {
        const cipherText = encrypt(plainText, secretPhrase);
        expect(() => decrypt(cipherText, 'wrong_password')).toThrowError(CryptoGuardianError);
        expect(() => decrypt(cipherText, 'wrong_password')).toThrowError(/Error de integridad/);
    });
    it('should throw an error if cipher text is manipulated (tampered authTag)', () => {
        const cipherText = encrypt(plainText, secretPhrase);
        const parts = cipherText.split(':');
        // Manipulate the encrypted text slightly (Bit-flipping simulation)
        const tamperedText = parts[3].substring(0, parts[3].length - 2) + '00';
        const tamperedCipherText = `${parts[0]}:${parts[1]}:${parts[2]}:${tamperedText}`;
        expect(() => decrypt(tamperedCipherText, secretPhrase)).toThrowError(CryptoGuardianError);
    });
    it('should throw an error if the format is invalid', () => {
        expect(() => decrypt('invalid-format', secretPhrase)).toThrowError(CryptoGuardianError);
        expect(() => decrypt('salt:iv:tag', secretPhrase)).toThrowError(/formato/);
    });
});
//# sourceMappingURL=cipher.test.js.map