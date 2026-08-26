export declare class CryptoGuardianError extends Error {
    constructor(message: string);
}
/**
 * Parámetros explícitos de scrypt para derivación de clave
 * N: costo de CPU/Memoria (16384)
 * r: tamaño de bloque (8)
 * p: factor de paralelización (1)
 * maxmem: memoria máxima permitida (32MB)
 */
export declare const SCRYPT_PARAMS: {
    N: number;
    r: number;
    p: number;
    maxmem: number;
};
/**
 * Secure Memory Wiping (Best-Effort Zeroization)
 * Sobreescribe el buffer con ceros para reducir el tiempo que claves sensibles
 * persistan en el Heap de V8/Node.js.
 */
export declare function wipeBuffer(buffer: Buffer): void;
/**
 * 1. Encriptar texto plano o Buffer usando una frase maestra y formato versionado CG01
 */
export declare function encrypt(text: string | Buffer, secretPhrase: string): string;
/**
 * 2. Desencriptar el bloque a Buffer asegurando integridad y compatibilidad legacy
 */
export declare function decryptBuffer(cipherText: string, secretPhrase: string): Buffer;
/**
 * 3. Desencriptar el bloque a una cadena utf8
 */
export declare function decrypt(cipherText: string, secretPhrase: string): string;
//# sourceMappingURL=cipher.d.ts.map