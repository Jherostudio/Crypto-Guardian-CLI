interface PasswordResult {
    password: string;
    entropy: number;
    level: 'DÉBIL' | 'MEDIA' | 'FUERTE' | 'EXTREMA';
}
export declare function calculateEntropy(password: string): number;
export declare function generateSecurePassword(length?: number): PasswordResult;
export {};
//# sourceMappingURL=entropy.d.ts.map