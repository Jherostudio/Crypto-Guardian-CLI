export declare class CryptoGuardianError extends Error {
    constructor(message: string);
}
/**
 * Secure Memory Wiping (Zeroization)
 * Sobreescribe el buffer con ceros para evitar que claves sensibles
 * persistan en la memoria RAM (prevención de memory scraping).
 */
export declare function wipeBuffer(buffer: Buffer): void;
/**
 * 1. Encriptar texto plano usando una frase maestra
 */
export declare function encrypt(text: string, secretPhrase: string): string;
/**
 * 2. Desencriptar el bloque asegurando la integridad
 */
export declare function decrypt(cipherText: string, secretPhrase: string): string;
//# sourceMappingURL=cipher.d.ts.map