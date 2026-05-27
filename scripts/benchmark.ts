import { performance } from 'node:perf_hooks';
import { generateSecurePassword } from '../src/entropy.js';
import { encrypt, decrypt } from '../src/cipher.js';

function runBenchmark(name: string, fn: () => void, iterations: number = 1000) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = performance.now();
    const totalTime = end - start;
    const opsPerSec = Math.floor((iterations / totalTime) * 1000);
    
    console.log(`\x1b[36m[Bench]\x1b[0m ${name}:`);
    console.log(`  - Iteraciones: ${iterations}`);
    console.log(`  - Tiempo Total: ${totalTime.toFixed(2)} ms`);
    console.log(`  - Rendimiento: \x1b[32m${opsPerSec.toLocaleString()} ops/sec\x1b[0m\n`);
}

console.log('\n=========================================');
console.log('🚀  PERFORMANCE BENCHMARK - CRYPTO GUARDIAN');
console.log('=========================================\n');

runBenchmark('Generar Contraseña (Length 32)', () => {
    generateSecurePassword(32);
}, 10000);

const textToEncrypt = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
const secretPhrase = 'my_super_secure_master_password_123';

runBenchmark('Encriptación (AES-256-GCM + Scrypt)', () => {
    encrypt(textToEncrypt, secretPhrase);
}, 100); // Scrypt is heavy by design, lower iterations

const encryptedPayload = encrypt(textToEncrypt, secretPhrase);

runBenchmark('Desencriptación (AES-256-GCM + Scrypt)', () => {
    decrypt(encryptedPayload, secretPhrase);
}, 100);

console.log('=========================================');
console.log('✅ Benchmark completado.');
