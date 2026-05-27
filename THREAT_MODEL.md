# Threat Model: Crypto Guardian CLI

## Resumen Ejecutivo
Crypto Guardian CLI es una herramienta de terminal diseñada para la generación segura de contraseñas y encriptación local simétrica de datos confidenciales (texto o archivos pequeños como `.env`). Este documento describe los vectores de ataque previstos y cómo el sistema los mitiga.

## 1. Alcance (Scope)
**Dentro del alcance:**
- Generación de contraseñas de alta entropía.
- Cálculo de entropía matemática (Shannon Entropy).
- Encriptación y desencriptación en tránsito local de credenciales usando AES-256-GCM.

**Fuera del alcance:**
- Compromiso a nivel de Sistema Operativo (Malware, Keyloggers).
- Ataques de canal lateral (Side-channel attacks) al procesador o memoria durante la ejecución en Node.js.
- Distribución o almacenamiento seguro prolongado (la CLI no guarda el texto original ni las contraseñas).

## 2. Suposiciones de Seguridad (Assumptions)
- El usuario opera en un entorno local seguro y confiable.
- La terminal no está grabando logs en texto plano de forma persistente.
- La frase maestra proporcionada por el usuario es lo suficientemente compleja.

## 3. Vectores de Ataque Identificados y Mitigaciones

### 3.1. Predicción del Generador de Números Aleatorios (PRNG)
* **Amenaza:** Si el generador de números aleatorios no es criptográficamente seguro, un atacante podría predecir las contraseñas generadas o los vectores de inicialización (IVs).
* **Mitigación:** Crypto Guardian utiliza exclusivamente `node:crypto` (`randomInt` y `randomBytes`), el cual está respaldado por el hardware y el CSPRNG del sistema operativo (por ejemplo, `/dev/urandom` en Unix), garantizando aleatoriedad criptográfica estricta.

### 3.2. Ataques de Fuerza Bruta a la Frase Maestra
* **Amenaza:** Un atacante que posea el bloque cifrado (`salt:iv:tag:text`) intenta adivinar la frase maestra iterando millones de posibilidades.
* **Mitigación:** Se utiliza la función de derivación de claves **scrypt** (`scryptSync`). Esta función incluye un factor de costo computacional y de memoria, lo que hace que los ataques de fuerza bruta (especialmente usando ASICs o GPUs) sean prohibitivamente lentos y costosos.

### 3.3. Manipulación del Texto Cifrado (Integridad)
* **Amenaza:** Un atacante intercepta el texto cifrado e intenta modificar bits (Bit-flipping attack) para alterar el contenido desencriptado resultante (por ejemplo, cambiar un valor "admin=false" a "admin=true").
* **Mitigación:** La encriptación utiliza **AES-256 en modo GCM (Galois/Counter Mode)**, un cifrado autenticado. El `authTag` generado previene estrictamente la manipulación; cualquier cambio a un solo byte del texto cifrado hará que el proceso de desencriptación lance una excepción y rechace el bloque por completo.

### 3.4. Ataque de Reutilización de IV (Nonce Reuse)
* **Amenaza:** En AES-GCM, reutilizar el mismo Vector de Inicialización (IV) con la misma llave anula la seguridad.
* **Mitigación:** Cada operación de cifrado genera un `salt` aleatorio de 16 bytes y un `iv` aleatorio de 12 bytes mediante `randomBytes()`. Esto garantiza un cifrado semánticamente seguro donde cifrar el mismo texto dos veces producirá resultados completamente distintos.

## 4. Limitaciones Conocidas
1. **Borrado en Memoria (Zeroing):** Node.js usa Garbage Collection. Las variables en memoria (como el texto plano) no pueden sobrescribirse con ceros manualmente de forma determinista una vez utilizadas, lo que significa que el texto plano podría residir temporalmente en la memoria RAM hasta que sea recolectado.
2. **Historial de la Terminal:** Si el usuario pasa secretos por argumentos en un futuro (CLI flags), estos pueden quedar guardados en el archivo `.bash_history` o `.zsh_history`. Se recomienda usar prompts interactivos (comportamiento actual) o variables de entorno para las llaves maestras.

## 5. Contacto de Seguridad
Para reportar vulnerabilidades en la implementación, por favor contactar al autor vía GitHub o abrir un Security Advisory privado en el repositorio de Crypto Guardian CLI.
