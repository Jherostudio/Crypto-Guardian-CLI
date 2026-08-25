# Threat Model: Crypto Guardian CLI (v2.0.0)

## Resumen Ejecutivo
Crypto Guardian CLI es una herramienta de terminal diseñada para la generación de contraseñas de alta entropía y la encriptación simétrica autenticada local (AES-256-GCM) de datos y archivos. Este documento establece los límites de protección, el modelo de amenaza y las mitigaciones técnicas implementadas.

---

## 1. Alcance (Scope)

### **Dentro del alcance:**
- Generación criptográficamente segura de contraseñas mediante CSPRNG de hardware (`node:crypto`).
- Estimación del espacio de búsqueda / entropía potencial ($E = L \cdot \log_2(R)$).
- Encriptación simétrica autenticada con **AES-256-GCM** y formato versionado **`CG01`**.
- Compatibilidad transparente hacia atrás con el formato cifrado legacy (v1).
- Derivación de claves con **scrypt** y parámetros explícitos (`N=16384, r=8, p=1, maxmem=32MB`).
- Escritura atómica de archivos en disco con protección contra sobrescritura accidental (`--force`).
- Limpieza preventiva de memoria (*best-effort zeroization*) en buffers de claves derivados.

### **Fuera del alcance:**
- Compromiso total a nivel de Sistema Operativo (Rootkits, Malware, Keyloggers activos).
- Garantía de borrado absoluto de cadenas inmutables de V8/Node.js en la memoria RAM (debido al recolector de basura Garbage Collector).
- Ataques de canal lateral (*Side-channel attacks*) a nivel de CPU hardware durante la ejecución de Node.js/OpenSSL.
- Manipulación física del almacenamiento donde residan archivos en texto plano antes de ser cifrados.

---

## 2. Suposiciones de Seguridad (Assumptions)

1. El usuario ejecuta la CLI en una estación de trabajo no comprometida por software malicioso.
2. El sistema operativo proporciona un generador de números aleatorios criptográficamente seguro (CSPRNG, ej. `/dev/urandom`).
3. La frase maestra elegida posee la suficiente entropía para resistir ataques de fuerza bruta offline.

---

## 3. Vectores de Ataque Identificados y Mitigaciones

### 3.1. Ataques de Fuerza Bruta Offline a la Frase Maestra
* **Amenaza:** Un atacante con acceso al ciphertext (`CG01:salt:iv:tag:text`) intenta adivinar la frase maestra mediante iteraciones masivas en GPU/ASIC.
* **Mitigación:** Se utiliza la función KDF **scryptSync** con parámetros explícitos (`N=16384, r=8, p=1`). El costo de memoria y CPU impone una barrera computacional prohibitiva para ataques por fuerza bruta. La seguridad final depende de la entropía de la frase maestra y del costo del KDF.

### 3.2. Manipulación y Tampering del Texto Cifrado (Integridad)
* **Amenaza:** Un atacante modifica el ciphertext para alterar el contenido desencriptado (*Bit-flipping attack*).
* **Mitigación:** AES-256-GCM incluye un Tag de Autenticación de 128 bits. Cualquier modificación en el ciphertext, IV, salt o authTag fallará la validación criptográfica y abortará la operación mediante una excepción segura (`CryptoGuardianError`).

### 3.3. Reutilización del Vector de Inicialización (Nonce Reuse)
* **Amenaza:** Reutilizar el mismo IV con la misma clave en AES-GCM compromete el cifrado.
* **Mitigación:** Cada encriptación genera un `salt` aleatorio único de 16 bytes y un `iv` aleatorio único de 12 bytes mediante `randomBytes()`. Cifrar el mismo contenido dos veces genera resultados completamente distintos.

### 3.4. Exposición de Secretos en Flags de Terminal
* **Amenaza:** Pasar la frase maestra mediante `--password "secreto"` puede registrar la clave en `.bash_history`, `.zsh_history`, visores de procesos (`ps aux`) o logs de CI/CD.
* **Mitigación:** Se recomienda omitir el flag `-p, --password` para activar la lectura interactiva sin echo directo, o utilizar variables de entorno en procesos automatizados.

### 3.5. Superficie de Ataque del Portapapeles (Clipboard)
* **Amenaza:** El portapapeles del sistema operativo es legible por cualquier aplicación nivel usuario que se ejecute en segundo plano.
* **Mitigación:** Se incluye el flag `--no-clipboard` para desactivar la copia automática al portapapeles cuando se requiera operar en entornos de alta confidencialidad.

---

## 4. Limitaciones Conocidas

1. **Borrado en Memoria (*Best-Effort Zeroization*):** Aunque se aplica `wipeBuffer(key)` en bloques `finally` para limpiar la clave del Heap de Node.js, V8 gestiona cadenas e internas inmutables mediante Garbage Collection. No se promete ni garantiza una "limpieza absoluta o determinista de memoria".
2. **Archivos Grandes en Memoria:** La CLI procesa archivos como Buffers completos en memoria RAM. Para archivos extremadamente grandes (varios Gigabytes), se recomienda dividir el archivo previamente.

---

## 5. Contacto de Seguridad
Para reportar vulnerabilidades o fallos de seguridad, favor de abrir un Security Advisory privado en el repositorio de GitHub de Crypto Guardian CLI.

