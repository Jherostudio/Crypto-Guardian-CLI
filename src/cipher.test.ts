import { describe, it, expect } from 'vitest';
import { createCipheriv, randomBytes, scryptSync } from 'node:crypto';
import { encrypt, decrypt, decryptBuffer, CryptoGuardianError } from './cipher.js';

describe('Crypto Guardian Cipher (AES-256-GCM + CG01)', () => {
    const secretPhrase = 'super_secret_master_password_123!';
    const plainText = '{"db_host": "localhost", "db_pass": "admin123"}';

    it('should encrypt and correctly format the cipher text using CG01 header', () => {
        const cipherText = encrypt(plainText, secretPhrase);
        const parts = cipherText.split(':');
        
        expect(parts.length).toBe(5); // CG01:salt:iv:tag:text
        expect(parts[0]).toBe('CG01'); // Header
        expect(parts[1]).toBeDefined(); // salt
        expect(parts[2]).toBeDefined(); // iv
        expect(parts[3]).toBeDefined(); // authTag
        expect(parts[4]).toBeDefined(); // encryptedHex
    });

    it('should successfully decrypt CG01 format with the correct phrase', () => {
        const cipherText = encrypt(plainText, secretPhrase);
        const decrypted = decrypt(cipherText, secretPhrase);
        expect(decrypted).toBe(plainText);
    });

    it('should successfully decrypt legacy 4-part format without CG01 header', () => {
        // Generar manualmente un cifrado legacy en formato v1 (salt:iv:tag:text)
        const salt = randomBytes(16);
        const iv = randomBytes(12);
        const key = scryptSync(secretPhrase, salt, 32); // Parámetros por defecto de node
        const cipher = createCipheriv('aes-256-gcm', key, iv);
        
        let encrypted = cipher.update(plainText, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag().toString('hex');
        
        const legacyCipherText = `${salt.toString('hex')}:${iv.toString('hex')}:${tag}:${encrypted}`;
        
        // Verificar que la función decrypt descifra correctamente el formato legacy
        const decrypted = decrypt(legacyCipherText, secretPhrase);
        expect(decrypted).toBe(plainText);
    });

    it('should throw an error with an incorrect phrase', () => {
        const cipherText = encrypt(plainText, secretPhrase);
        expect(() => decrypt(cipherText, 'wrong_password')).toThrowError(CryptoGuardianError);
        expect(() => decrypt(cipherText, 'wrong_password')).toThrowError(/Error de integridad/);
    });

    it('should throw an error if cipher text is manipulated (tampered authTag or ciphertext)', () => {
        const cipherText = encrypt(plainText, secretPhrase);
        const parts = cipherText.split(':');
        
        // Manipulate the encrypted text slightly (Bit-flipping simulation)
        const tamperedText = parts[4]!.substring(0, parts[4]!.length - 2) + '00';
        const tamperedCipherText = `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}:${tamperedText}`;

        expect(() => decrypt(tamperedCipherText, secretPhrase)).toThrowError(CryptoGuardianError);
    });

    it('should throw an error if salt or IV is corrupted', () => {
        const cipherText = encrypt(plainText, secretPhrase);
        const parts = cipherText.split(':');
        
        const corruptedSalt = `${parts[0]}:${'00'.repeat(16)}:${parts[2]}:${parts[3]}:${parts[4]}`;
        expect(() => decrypt(corruptedSalt, secretPhrase)).toThrowError(CryptoGuardianError);
    });

    it('should throw an error if the format is invalid', () => {
        expect(() => decrypt('invalid-format', secretPhrase)).toThrowError(CryptoGuardianError);
        expect(() => decrypt('salt:iv:tag', secretPhrase)).toThrowError(/formato/);
    });

    it('should produce different ciphertexts for identical plaintext (salt & nonce uniqueness)', () => {
        const cipher1 = encrypt(plainText, secretPhrase);
        const cipher2 = encrypt(plainText, secretPhrase);
        expect(cipher1).not.toBe(cipher2);
    });

    it('should encrypt and decrypt binary Buffers cleanly (decryptBuffer)', () => {
        const binaryData = Buffer.from([0x00, 0xff, 0xca, 0xfe, 0xba, 0xbe, 0x12, 0x34]);
        const cipherText = encrypt(binaryData, secretPhrase);
        const decryptedBuffer = decryptBuffer(cipherText, secretPhrase);

        expect(Buffer.isBuffer(decryptedBuffer)).toBe(true);
        expect(decryptedBuffer.equals(binaryData)).toBe(true);
    });

    it('should handle special characters, emojis, and unicode strings', () => {
        const complexText = '🔐 Safe Storage! 🚀 ESPAÑOL & 中文 & Special: \n \t \0 \' "';
        const encrypted = encrypt(complexText, secretPhrase);
        const decrypted = decrypt(encrypted, secretPhrase);
        expect(decrypted).toBe(complexText);
    });
});

