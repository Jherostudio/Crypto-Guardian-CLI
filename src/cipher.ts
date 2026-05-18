import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

// Configuración del algoritmo estándar de la industria (AES-256 en modo GCM)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Vector de inicialización para GCM
const SALT_LENGTH = 16;

/**
 * 1. Encriptar texto plano usando una frase maestra
 */
export function encrypt(text: string, secretPhrase: string): string {
    // Generar un salt y un IV aleatorios por cada encriptación para máxima seguridad
    const salt = randomBytes(SALT_LENGTH);
    const iv = randomBytes(IV_LENGTH);

    // Derivar una llave segura de 32 bytes (256 bits) a partir de la frase del usuario
    const key = scryptSync(secretPhrase, salt, 32);

    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Obtener el tag de autenticación (GCM asegura que el contenido no sea manipulado)
    const authTag = cipher.getAuthTag().toString('hex');

    // Empaquetar todo en una sola cadena para fácil almacenamiento
    return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * 2. Desencriptar el bloque asegurando la integridad
 */
export function decrypt(cipherText: string, secretPhrase: string): string {
    const [saltHex, ivHex, authTagHex, encryptedHex] = cipherText.split(':');

    if (!saltHex || !ivHex || !authTagHex || !encryptedHex) {
        throw new Error('El formato del texto cifrado es inválido.');
    }

    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    // Derivar exactamente la misma llave usando la frase maestra y el salt original
    const key = scryptSync(secretPhrase, salt, 32);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}