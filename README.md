# Crypto Guardian CLI 🔐

<div align="center">
  <img src="demo.gif" alt="Crypto Guardian CLI Demo" width="800"/>
</div>

<p align="center">
  <a href="https://github.com/Jherostudio/Crypto-Guardian-CLI/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Jherostudio/Crypto-Guardian-CLI/ci.yml?style=flat-square&label=CI%20Pipeline" alt="CI Pipeline"></a>
  <a href="https://github.com/Jherostudio/Crypto-Guardian-CLI/actions/workflows/codeql.yml"><img src="https://img.shields.io/github/actions/workflow/status/Jherostudio/Crypto-Guardian-CLI/codeql.yml?style=flat-square&label=CodeQL%20Security" alt="CodeQL Security Scan"></a>
  <a href="https://www.npmjs.com/package/@jherostudio/crypto-guardian-cli"><img src="https://img.shields.io/npm/v/@jherostudio/crypto-guardian-cli.svg?style=flat-square&color=blue" alt="npm version"></a>
  <img src="https://img.shields.io/badge/Security-AES--256--GCM%20(CG01)-success?style=flat-square" alt="Security Standard">
  <img src="https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square" alt="License: ISC">
</p>

An enterprise-grade, interactive TypeScript Command Line Interface (CLI) engineered for secure password generation, real-time entropy calculation, and hardware-accelerated **AES-256-GCM (CG01)** authenticated data & file encryption/decryption.

Developed under defensive AppSec standards by **Jhero Studio**.

---

## ⚡ Key Security & Architectural Features

* **Authenticated Encryption (AEAD):** Implements `AES-256-GCM` with dynamic initialization vectors (IVs), salt, and authentication tags (`CG01`) to guarantee confidentiality and cryptographic integrity.
* **Full Legacy Backward Compatibility:** Transparently decrypts older v1 (`salt:iv:tag:text`) encrypted payloads and `.enc` files.
* **Information-Theoretic Entropy:** Computes real-time potential entropy ($E = L \cdot \log_2(R)$) to detect weak character patterns and prevent brute-force/dictionary vulnerabilities.
* **CSPRNG Generation:** Uses native hardware cryptographic pseudo-random number generators (`crypto.randomBytes` / `randomInt`) for high-security key and password derivation.
* **Atomic Binary File Handling:** Encrypts and decrypts any physical file (images, PDFs, ZIPs, `.env`) with atomic disk writes and overwrite protection (`--force`).
* **Best-Effort Memory Zeroization:** Cryptographic keys are zeroized (`Buffer.fill(0)`) in `finally` blocks immediately after OpenSSL context initialization.
* **Zero External Network Dependencies:** 100% offline runtime operation with zero telemetry or third-party data transmission.
* **Threat Modeled Architecture:** Built following strict security guidelines detailed in [`THREAT_MODEL.md`](./THREAT_MODEL.md).

---

## 📦 Installation

### Global via npm
```bash
npm install -g @jherostudio/crypto-guardian-cli
```

### Local Development Setup
```bash
git clone https://github.com/Jherostudio/Crypto-Guardian-CLI.git
cd Crypto-Guardian-CLI
npm ci
npm run build
npm test
```

---

## 🚀 Usage Guide

### Interactive Mode
Run the interactive ASCII-art CLI directly from your terminal:
```bash
crypto-guardian
# or locally: npm start
```

Or execute directly via `npx`:
```bash
npx @jherostudio/crypto-guardian-cli
```

### Scripting & Automation (CLI Flags)

**1. Generate Passwords:**
Configurable length with live entropy evaluation and optional `--no-clipboard` flag:
```bash
crypto-guardian generate --length 32
crypto-guardian generate --length 24 --no-clipboard
```

**2. Encrypt Payload / Physical Files:**
Authenticated encryption using AES-256-GCM `CG01` with user-supplied passphrases (or secure prompt):
```bash
crypto-guardian encrypt --text "DB_HOST=localhost" --password "master_key"
crypto-guardian encrypt-file --file ./.env --password "master_key"
crypto-guardian encrypt-file --file ./document.pdf --force
```

**3. Decrypt Payload / Physical Files:**
Verifies authentication tags and decrypts ciphertext payloads safely:
```bash
crypto-guardian decrypt --cipher "CG01:salt:iv:tag:text" --password "master_key"
crypto-guardian decrypt-file --file ./.env.enc
```

**4. Entropy Analysis:**
Audit arbitrary strings and credentials against mathematical entropy thresholds:
```bash
crypto-guardian audit --password "MySuperS3cr3t!"
```

---

## 🧪 Testing & Benchmarking

```bash
# Run unit & cryptographic test suite (Vitest)
npm test

# Run build compilation
npm run build

# Run performance & cryptographic benchmarks
npm run bench
```

---

## 🛡️ Security & Audits

This repository enforces automated static application security testing (SAST) and dependency vulnerability gates:

* **CodeQL SAST:** Continuous vulnerability scanning against CWE standards.
* **npm Audit:** Zero tolerance for high/critical security advisories in production and build pipelines.
* **Threat Model:** For security reports, vulnerability disclosures, or threat modeling specifics, refer to [`THREAT_MODEL.md`](./THREAT_MODEL.md).

---

## 📄 License

Distributed under the ISC License. Developed with defensive engineering standards by [Jhero Studio](https://github.com/Jherostudio).
