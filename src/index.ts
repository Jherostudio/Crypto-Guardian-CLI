#!/usr/bin/env node
import { createInterface } from 'node:readline';
import { generateSecurePassword } from './entropy.js';
import { encrypt, decrypt } from './cipher.js';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

function showMenu() {
    console.log('\n==================================================');
    console.log('       🛡️  GUARDIÁN CRIPTOGRÁFICO v1.0  🛡️');
    console.log('==================================================');
    console.log('1. Generar Contraseña Militar (Cálculo de Entropía)');
    console.log('2. Encriptar Credenciales o Texto (AES-256-GCM)');
    console.log('3. Desencriptar Bloque Seguro');
    console.log('4. Salir del Sistema');
    console.log('==================================================');

    rl.question('⚡ Selecciona una operación [1-4]: ', (choice) => {
        switch (choice.trim()) {
            case '1':
                rl.question('\n🔑 Longitud deseada (Enter para 16): ', (len) => {
                    const length = len ? parseInt(len) : 16;
                    const res = generateSecurePassword(length);
                    console.log(`\n✅ Generada: \x1b[32m${res.password}\x1b[0m`);
                    console.log(`📊 Entropía: ${res.entropy} bits [${res.level}]`);
                    showMenu();
                });
                break;

            case '2':
                rl.question('\n📝 Introduce el texto secreto o .env: ', (text) => {
                    rl.question('🔐 Introduce la frase maestra de cifrado: ', (phrase) => {
                        const encrypted = encrypt(text, phrase);
                        console.log('\n📦 \x1b[33mBloque Cifrado Seguro:\x1b[0m');
                        console.log(`\x1b[36m${encrypted}\x1b[0m`);
                        showMenu();
                    });
                });
                break;

            case '3':
                rl.question('\n📦 Pega el bloque cifrado (salt:iv:tag:text): ', (cipherText) => {
                    rl.question('🔐 Introduce la frase maestra para descifrar: ', (phrase) => {
                        try {
                            const decrypted = decrypt(cipherText.trim(), phrase);
                            console.log(`\n✨ \x1b[32mTexto Recuperado Exitosamente:\x1b[0m\n${decrypted}`);
                        } catch (err) {
                            console.log('\n❌ \x1b[31mError:\x1b[0m Llave incorrecta o bloque manipulado.');
                        }
                        showMenu();
                    });
                });
                break;

            case '4':
                console.log('\n🔒 Cerrando búnker. Conexión segura terminada.');
                rl.close();
                break;

            default:
                console.log('\n❌ Opción no válida.');
                showMenu();
                break;
        }
    });
}

// Iniciar la CLI
showMenu();