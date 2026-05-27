import { randomInt } from 'node:crypto';

interface PasswordResult {
    password: string;
    entropy: number;
    level: 'DÉBIL' | 'MEDIA' | 'FUERTE' | 'EXTREMA';
}

// 1. Calcular la entropía matemática real
export function calculateEntropy(password: string): number {
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32; // Símbolos especiales

    if (poolSize === 0 || password.length === 0) return 0;

    // Fórmula: L * log2(R)
    return parseFloat((password.length * Math.log2(poolSize)).toFixed(2));
}

// 2. Determinar el nivel de seguridad basado en los bits de entropía
function getSecurityLevel(entropy: number): 'DÉBIL' | 'MEDIA' | 'FUERTE' | 'EXTREMA' {
    if (entropy < 40) return 'DÉBIL';
    if (entropy < 60) return 'MEDIA';
    if (entropy < 80) return 'FUERTE';
    return 'EXTREMA';
}

// 3. Generador criptográficamente seguro usando hardware (crypto nativo)
export function generateSecurePassword(length: number = 16): PasswordResult {
    const chars = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        digits: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    const allChars = chars.upper + chars.lower + chars.digits + chars.symbols;
    const passwordChars: string[] = [];

    // Asegurar que al menos tenga uno de cada tipo para evitar debilidad
    passwordChars.push(chars.upper[randomInt(chars.upper.length)]!);
    passwordChars.push(chars.lower[randomInt(chars.lower.length)]!);
    passwordChars.push(chars.digits[randomInt(chars.digits.length)]!);
    passwordChars.push(chars.symbols[randomInt(chars.symbols.length)]!);

    // Llenar el resto de la longitud de forma aleatoria segura
    for (let i = passwordChars.length; i < length; i++) {
        passwordChars.push(allChars[randomInt(allChars.length)]!);
    }

    // Mezclar los caracteres para romper el orden del inicio (Fisher-Yates)
    for (let i = passwordChars.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        const temp = passwordChars[i]!;
        passwordChars[i] = passwordChars[j]!;
        passwordChars[j] = temp;
    }

    const password = passwordChars.join('');
    const entropy = calculateEntropy(password);

    return {
        password,
        entropy,
        level: getSecurityLevel(entropy)
    };
}