#!/usr/bin/env node
import { createInterface } from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { Command } from 'commander';
import clipboardy from 'clipboardy';
import figlet from 'figlet';
import { generateSecurePassword, calculateEntropy } from './entropy.js';
import { encrypt, decrypt, decryptBuffer, CryptoGuardianError } from './cipher.js';

const program = new Command();

program
  .name('crypto-guardian')
  .description('Herramienta CLI de encriptación AES-256-GCM y generador de contraseñas de alta entropía')
  .version('2.0.0');

/**
 * Función auxiliar para escritura atómica de archivos en disco
 */
function writeAtomically(outPath: string, data: Buffer | string, force: boolean): void {
    if (fs.existsSync(outPath) && !force) {
        throw new CryptoGuardianError(`El archivo de salida ya existe: ${outPath}. Usa --force para sobrescribir.`);
    }
    const tempPath = `${outPath}.${randomBytes(4).toString('hex')}.tmp`;
    try {
        fs.writeFileSync(tempPath, data);
        fs.renameSync(tempPath, outPath);
    } catch (err) {
        if (fs.existsSync(tempPath)) {
            try { fs.unlinkSync(tempPath); } catch {}
        }
        throw err;
    }
}

/**
 * Obtener frase maestra de la opción CLI o solicitándola interactivamente
 */
async function resolvePassword(providedPassword?: string): Promise<string> {
    if (providedPassword && providedPassword.trim().length > 0) {
        return providedPassword;
    }
    return new Promise((resolve) => {
        const tempRl = createInterface({
            input: process.stdin,
            output: process.stdout
        });
        tempRl.question('🔐 Introduce la frase maestra de cifrado: ', (answer) => {
            tempRl.close();
            resolve(answer);
        });
    });
}

// ==========================================
// CLI FLAGS (No interactivo)
// ==========================================

program
    .command('generate')
    .description('Genera una contraseña segura y la copia al portapapeles')
    .option('-l, --length <number>', 'Longitud de la contraseña', '16')
    .option('--no-clipboard', 'No copiar la contraseña generada al portapapeles')
    .action((options) => {
        const length = parseInt(options.length, 10);
        const res = generateSecurePassword(length);
        
        console.log(`\n✅ Generada: \x1b[32m${res.password}\x1b[0m`);
        console.log(`📊 Estimación de Entropía: ${res.entropy} bits [${res.level}]`);
        
        if (options.clipboard !== false) {
            clipboardy.writeSync(res.password);
            console.log('\n📋 \x1b[36m¡Copiada al portapapeles automáticamente!\x1b[0m\n');
        } else {
            console.log('\nℹ️ \x1b[90mCopiado al portapapeles omitido (--no-clipboard).\x1b[0m\n');
        }
        process.exit(0);
    });

program
    .command('encrypt')
    .description('Encripta un texto usando AES-256-GCM y formato versionado CG01')
    .requiredOption('-t, --text <string>', 'Texto a encriptar')
    .option('-p, --password <string>', 'Frase maestra de cifrado (omite para prompt seguro)')
    .option('--no-clipboard', 'No copiar el resultado al portapapeles')
    .action(async (options) => {
        try {
            const password = await resolvePassword(options.password);
            const encrypted = encrypt(options.text, password);
            console.log('\n📦 \x1b[33mBloque Cifrado Seguro (CG01):\x1b[0m');
            console.log(`\x1b[36m${encrypted}\x1b[0m`);
            
            if (options.clipboard !== false) {
                clipboardy.writeSync(encrypted);
                console.log('\n📋 \x1b[36m¡Bloque copiado al portapapeles!\x1b[0m\n');
            }
            process.exit(0);
        } catch (err: any) {
            console.error(`\n❌ \x1b[31mError:\x1b[0m ${err.message}\n`);
            process.exit(1);
        }
    });

program
    .command('decrypt')
    .description('Desencripta un bloque seguro AES-256-GCM (soporta formatos CG01 y legacy)')
    .requiredOption('-c, --cipher <string>', 'Bloque cifrado (salt:iv:tag:text o CG01:...)')
    .option('-p, --password <string>', 'Frase maestra de cifrado (omite para prompt seguro)')
    .action(async (options) => {
        try {
            const password = await resolvePassword(options.password);
            const decrypted = decrypt(options.cipher, password);
            console.log(`\n✨ \x1b[32mTexto Recuperado Exitosamente:\x1b[0m\n${decrypted}\n`);
            process.exit(0);
        } catch (err) {
            if (err instanceof CryptoGuardianError) {
                console.error(`\n❌ \x1b[31mError:\x1b[0m ${err.message}\n`);
            } else {
                console.error('\n❌ \x1b[31mError inesperado:\x1b[0m Ocurrió un fallo en la desencriptación.\n');
            }
            process.exit(1);
        }
    });

program
    .command('audit')
    .description('Audita una contraseña para evaluar su fortaleza matemática')
    .requiredOption('-p, --password <string>', 'Contraseña a auditar')
    .action((options) => {
        const entropy = calculateEntropy(options.password);
        let level = 'DÉBIL';
        if (entropy >= 80) level = 'EXTREMA';
        else if (entropy >= 60) level = 'FUERTE';
        else if (entropy >= 40) level = 'MEDIA';

        console.log(`\n🔍 Auditoría de Contraseña:`);
        console.log(`📊 Estimación de Entropía: \x1b[33m${entropy} bits\x1b[0m`);
        console.log(`🛡️  Nivel de Seguridad: \x1b[32m[${level}]\x1b[0m\n`);
        process.exit(0);
    });

program
    .command('encrypt-file')
    .description('Encripta un archivo físico en disco (.env, pdf, zip, etc)')
    .requiredOption('-f, --file <string>', 'Ruta del archivo')
    .option('-p, --password <string>', 'Frase maestra de cifrado (omite para prompt seguro)')
    .option('--force', 'Sobrescribir archivo de salida si ya existe')
    .action(async (options) => {
        try {
            const filePath = path.resolve(options.file);
            if (!fs.existsSync(filePath)) {
                throw new CryptoGuardianError(`El archivo no existe: ${filePath}`);
            }

            const password = await resolvePassword(options.password);
            const contentBuffer = fs.readFileSync(filePath);
            const encrypted = encrypt(contentBuffer, password);
            
            const outPath = `${filePath}.enc`;
            writeAtomically(outPath, encrypted, !!options.force);
            
            console.log(`\n✅ \x1b[32mArchivo encriptado con éxito:\x1b[0m ${outPath}\n`);
            process.exit(0);
        } catch (err: any) {
            console.error(`\n❌ \x1b[31mError al procesar archivo:\x1b[0m ${err.message}\n`);
            process.exit(1);
        }
    });

program
    .command('decrypt-file')
    .description('Desencripta un archivo cifrado (.enc)')
    .requiredOption('-f, --file <string>', 'Ruta del archivo encriptado')
    .option('-p, --password <string>', 'Frase maestra de cifrado (omite para prompt seguro)')
    .option('--force', 'Sobrescribir archivo de salida si ya existe')
    .action(async (options) => {
        try {
            const filePath = path.resolve(options.file);
            if (!fs.existsSync(filePath)) {
                throw new CryptoGuardianError(`El archivo no existe: ${filePath}`);
            }

            const password = await resolvePassword(options.password);
            const content = fs.readFileSync(filePath, 'utf8');
            const decryptedBuffer = decryptBuffer(content.trim(), password);
            
            const outPath = filePath.endsWith('.enc')
                ? filePath.slice(0, -4)
                : `${filePath}.decrypted`;

            writeAtomically(outPath, decryptedBuffer, !!options.force);

            console.log(`\n✨ \x1b[32mArchivo desencriptado con éxito:\x1b[0m ${outPath}\n`);
            process.exit(0);
        } catch (err: any) {
            if (err instanceof CryptoGuardianError) {
                console.error(`\n❌ \x1b[31mError de seguridad:\x1b[0m ${err.message}\n`);
            } else {
                console.error(`\n❌ \x1b[31mError al procesar archivo:\x1b[0m ${err.message}\n`);
            }
            process.exit(1);
        }
    });

// ==========================================
// MODO INTERACTIVO (Si no se pasan argumentos)
// ==========================================

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

function promptContinue() {
    rl.question('\n👉 Presiona ENTER para volver al menú principal...', () => {
        showMenu();
    });
}

function showMenu() {
    console.clear();
    console.log('\x1b[38;5;208m' + figlet.textSync('GUARDIAN CLI', { font: 'Standard' }) + '\x1b[0m');
    console.log('                                  \x1b[36m[ by Jhero Studio ]\x1b[0m\n');
    console.log('\x1b[90m=========================================================================\x1b[0m');
    console.log(' \x1b[32m[1]\x1b[0m Generar Contraseña Criptográficamente Segura (Alta Entropía)');
    console.log(' \x1b[32m[2]\x1b[0m Encriptar Credenciales o Texto (AES-256-GCM CG01)');
    console.log(' \x1b[32m[3]\x1b[0m Desencriptar Bloque Seguro');
    console.log(' \x1b[32m[4]\x1b[0m Auditar una Contraseña Propia');
    console.log(' \x1b[32m[5]\x1b[0m Encriptar un Archivo en Disco (Ej. .env, PDF, ZIP)');
    console.log(' \x1b[31m[6]\x1b[0m Salir del Sistema');
    console.log('\x1b[90m=========================================================================\x1b[0m');

    rl.question('\n⚡ Selecciona una operación [1-6]: ', (choice) => {
        switch (choice.trim()) {
            case '1':
                rl.question('\n🔑 Longitud deseada (Enter para 16): ', (len) => {
                    const length = len ? parseInt(len) : 16;
                    const res = generateSecurePassword(length);
                    console.log(`\n✅ Generada: \x1b[32m${res.password}\x1b[0m`);
                    console.log(`📊 Estimación de Entropía: ${res.entropy} bits [${res.level}]`);
                    
                    clipboardy.writeSync(res.password);
                    console.log('\n📋 \x1b[36m¡Copiada al portapapeles automáticamente!\x1b[0m');
                    promptContinue();
                });
                break;

            case '2':
                rl.question('\n📝 Introduce el texto secreto o .env: ', (text) => {
                    rl.question('🔐 Introduce la frase maestra de cifrado: ', (phrase) => {
                        const encrypted = encrypt(text, phrase);
                        console.log('\n📦 \x1b[33mBloque Cifrado Seguro (CG01):\x1b[0m');
                        console.log(`\x1b[36m${encrypted}\x1b[0m`);
                        
                        clipboardy.writeSync(encrypted);
                        console.log('\n📋 \x1b[36m¡Bloque copiado al portapapeles!\x1b[0m');
                        promptContinue();
                    });
                });
                break;

            case '3':
                rl.question('\n📦 Pega el bloque cifrado (salt:iv:tag:text o CG01:...): ', (cipherText) => {
                    rl.question('🔐 Introduce la frase maestra para descifrar: ', (phrase) => {
                        try {
                            const decrypted = decrypt(cipherText.trim(), phrase);
                            console.log(`\n✨ \x1b[32mTexto Recuperado Exitosamente:\x1b[0m\n${decrypted}`);
                        } catch (err) {
                            if (err instanceof CryptoGuardianError) {
                                console.log(`\n❌ \x1b[31mError:\x1b[0m ${err.message}`);
                            } else {
                                console.log('\n❌ \x1b[31mError:\x1b[0m Llave incorrecta o bloque manipulado.');
                            }
                        }
                        promptContinue();
                    });
                });
                break;
                
            case '4':
                rl.question('\n🔍 Introduce la contraseña a auditar: ', (pass) => {
                    const entropy = calculateEntropy(pass);
                    let level = 'DÉBIL';
                    if (entropy >= 80) level = 'EXTREMA';
                    else if (entropy >= 60) level = 'FUERTE';
                    else if (entropy >= 40) level = 'MEDIA';

                    console.log(`\n📊 Estimación de Entropía: \x1b[33m${entropy} bits\x1b[0m`);
                    console.log(`🛡️  Nivel de Seguridad: \x1b[32m[${level}]\x1b[0m`);
                    promptContinue();
                });
                break;
                
            case '5':
                rl.question('\n📄 Introduce la ruta del archivo a encriptar (ej. .env, doc.pdf): ', (filePath) => {
                    rl.question('🔐 Introduce la frase maestra de cifrado: ', (phrase) => {
                        try {
                            const fullPath = path.resolve(filePath.trim());
                            if (!fs.existsSync(fullPath)) {
                                throw new CryptoGuardianError(`El archivo no existe: ${fullPath}`);
                            }
                            const contentBuffer = fs.readFileSync(fullPath);
                            const encrypted = encrypt(contentBuffer, phrase);
                            const outPath = `${fullPath}.enc`;
                            writeAtomically(outPath, encrypted, true);
                            console.log(`\n✅ \x1b[32mArchivo encriptado guardado en:\x1b[0m ${outPath}`);
                        } catch (err: any) {
                            console.log(`\n❌ \x1b[31mError:\x1b[0m ${err.message}`);
                        }
                        promptContinue();
                    });
                });
                break;

            case '6':
                console.log('\n🔒 Cerrando búnker. Conexión segura terminada.\n');
                rl.close();
                break;

            default:
                console.log('\n❌ Opción no válida.');
                promptContinue();
                break;
        }
    });
}

// Si no se pasaron argumentos (solo node index.js), iniciar modo interactivo
if (process.argv.slice(2).length === 0) {
    showMenu();
} else {
    // Analizar argumentos de la línea de comandos
    program.parse(process.argv);
}