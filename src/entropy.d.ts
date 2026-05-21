interface PasswordResult {
    password: string;
    entropy: number;
    level: 'DEBIL' | 'MEDIA' | 'FUERTE' | 'MILITAR';
}
export declare function calculateEntropy(password: string): number;
export declare function generateSecurePassword(length?: number): PasswordResult;
export {};
//# sourceMappingURL=entropy.d.ts.map