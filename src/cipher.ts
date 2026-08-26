import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

export class CryptoGuardianError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CryptoGuardianError';
    }
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Vector de inicialización para GCM (96 bits)
const SALT_LENGTH = 16; // Salt de 128 bits para KDF

/**
 * Parámetros explícitos de scrypt para derivación de clave
 * N: costo de CPU/Memoria (16384)
 * r: tamaño de bloque (8)
 * p: factor de paralelización (1)
 * maxmem: memoria máxima permitida (32MB)
 */
export const SCRYPT_PARAMS = {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024
};

/**
 * Secure Memory Wiping (Best-Effort Zeroization)
 * Sobreescribe el buffer con ceros para reducir el tiempo que claves sensibles 
 * persistan en el Heap de V8/Node.js.
 */
export function wipeBuffer(buffer: Buffer): void {
    if (Buffer.isBuffer(buffer)) {
        buffer.fill(0);
    }
}

/**
 * 1. Encriptar texto plano o Buffer usando una frase maestra y formato versionado CG01
 */
export function encrypt(text: string | Buffer, secretPhrase: string): string {
    const salt = randomBytes(SALT_LENGTH);
    const iv = randomBytes(IV_LENGTH);

    // Derivar llave de 256 bits usando scrypt con parámetros explícitos
    const key = scryptSync(secretPhrase, salt, 32, SCRYPT_PARAMS) as Buffer;

    try {
        const cipher = createCipheriv(ALGORITHM, key, iv);
        const inputBuffer = typeof text === 'string' ? Buffer.from(text, 'utf8') : text;

        const encrypted = Buffer.concat([cipher.update(inputBuffer), cipher.final()]);
        const authTag = cipher.getAuthTag();

        // Empaquetar usando el formato versionado CG01
        return `CG01:${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
    } finally {
        // Zeroization determinista en bloque finally
        wipeBuffer(key);
    }
}

/**
 * 2. Desencriptar el bloque a Buffer asegurando integridad y compatibilidad legacy
 */
export function decryptBuffer(cipherText: string, secretPhrase: string): Buffer {
    const raw = cipherText.trim();
    const parts = raw.split(':');

    let saltHex: string | undefined;
    let ivHex: string | undefined;
    let authTagHex: string | undefined;
    let encryptedHex: string | undefined;
    let isLegacy = false;

    if (parts.length === 5 && parts[0] === 'CG01') {
        [, saltHex, ivHex, authTagHex, encryptedHex] = parts;
    } else if (parts.length === 4) {
        [saltHex, ivHex, authTagHex, encryptedHex] = parts;
        isLegacy = true;
    } else {
        throw new CryptoGuardianError('El formato del texto cifrado es inválido. Formato esperado: CG01:salt:iv:tag:text');
    }

    if (!saltHex || !ivHex || !authTagHex || !encryptedHex) {
        throw new CryptoGuardianError('El formato del texto cifrado es inválido. Campos de encabezado incompletos.');
    }

    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encryptedBuffer = Buffer.from(encryptedHex, 'hex');

    // Derivar la llave utilizando scrypt (parámetros legacy o nuevos CG01)
    const key = isLegacy
        ? (scryptSync(secretPhrase, salt, 32) as Buffer)
        : (scryptSync(secretPhrase, salt, 32, SCRYPT_PARAMS) as Buffer);

    try {
        const decipher = createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
        return decrypted;
    } catch (error: any) {
        throw new CryptoGuardianError('Error de integridad: La llave maestra es incorrecta o el bloque fue manipulado.');
    } finally {
        // Zeroization determinista en bloque finally
        wipeBuffer(key);
    }
}

/**
 * 3. Desencriptar el bloque a una cadena utf8
 */
export function decrypt(cipherText: string, secretPhrase: string): string {
    const buffer = decryptBuffer(cipherText, secretPhrase);
    return buffer.toString('utf8');
}