import { describe, it, expect } from 'vitest';
import { calculateEntropy, generateSecurePassword } from './entropy.js';

describe('Crypto Guardian Entropy Generator', () => {
    
    describe('calculateEntropy', () => {
        it('should return 0 for empty strings', () => {
            expect(calculateEntropy('')).toBe(0);
        });

        it('should calculate higher entropy for complex passwords', () => {
            const low = calculateEntropy('123456'); // Solo números
            const med = calculateEntropy('Abcdef12'); // Letras y números
            const high = calculateEntropy('Abcdef12!@#'); // Letras, números y símbolos

            expect(med).toBeGreaterThan(low);
            expect(high).toBeGreaterThan(med);
        });
    });

    describe('generateSecurePassword', () => {
        it('should generate a password of the requested length', () => {
            const res = generateSecurePassword(24);
            expect(res.password.length).toBe(24);
            expect(res.entropy).toBeGreaterThan(0);
            expect(res.level).toBeDefined();
        });

        it('should contain at least one of each character type (lower, upper, digit, symbol)', () => {
            const { password } = generateSecurePassword(16);
            
            expect(/[a-z]/.test(password)).toBe(true);
            expect(/[A-Z]/.test(password)).toBe(true);
            expect(/[0-9]/.test(password)).toBe(true);
            expect(/[^a-zA-Z0-9]/.test(password)).toBe(true);
        });

        it('should achieve EXTREMA level for default length 16 with all char types', () => {
            const { level } = generateSecurePassword(16);
            // 16 chars from a 94-char pool gives ~104 bits of entropy (>80 is EXTREMA)
            expect(level).toBe('EXTREMA');
        });

        it('should safely handle edge case length values (0, negative, NaN, Infinity, extreme sizes)', () => {
            expect(generateSecurePassword(0).password.length).toBe(4); // min bound
            expect(generateSecurePassword(-10).password.length).toBe(4); // min bound
            expect(generateSecurePassword(NaN).password.length).toBe(16); // fallback default
            expect(generateSecurePassword(Infinity).password.length).toBe(1024); // max bound
            expect(generateSecurePassword(5000).password.length).toBe(1024); // max bound
            expect(generateSecurePassword(12.8).password.length).toBe(12); // floored
        });
    });
});
