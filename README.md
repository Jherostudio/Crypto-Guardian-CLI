# Crypto Guardian CLI 🛡️

<div align="center">
  <img src="demo.gif" alt="Crypto Guardian CLI Demo" width="800"/>
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/@jherostudio/crypto-guardian-cli"><img src="https://img.shields.io/npm/v/@jherostudio/crypto-guardian-cli?style=flat-square&color=blue" alt="npm version"></a>
  <a href="https://github.com/Jherostudio/Crypto-Guardian-CLI/actions"><img src="https://img.shields.io/github/actions/workflow/status/Jherostudio/Crypto-Guardian-CLI/ci.yml?style=flat-square" alt="CI Status"></a>
  <a href="https://github.com/Jherostudio/Crypto-Guardian-CLI/security/code-scanning"><img src="https://img.shields.io/github/actions/workflow/status/Jherostudio/Crypto-Guardian-CLI/codeql.yml?label=CodeQL&style=flat-square" alt="CodeQL Status"></a>
  <img src="https://img.shields.io/badge/Security-AES--256--GCM%20(CG01)-success?style=flat-square" alt="Security Standard">
</p>

A professional, secure, and production-ready Command Line Interface (CLI) tool designed for robust cryptographic operations. Built natively in TypeScript, it leverages hardware-backed cryptography to generate high-entropy passwords, perform authenticated symmetric encryption (AES-256-GCM `CG01`) on physical files and text strings, and manage memory via best-effort zeroization.

Developed under strict AppSec standards by **Jhero Studio**.

---

## ⚡ Key Features

* **High-Entropy Password Generation:** Generates cryptographically secure random passwords using OS-level CSPRNG (`node:crypto`).
* **Entropy Space Estimation:** Real-time mathematical evaluation of password strength ($E = L \cdot \log_2(R)$) to classify security levels up to `EXTREMA` status (>80 bits).
* **Versioned & Authenticated Encryption (CG01):** AES-256-GCM symmetric encryption with explicit `scrypt` parameters (`N=16384, r=8, p=1`).
* **Full Legacy Compatibility:** Decrypts older v1 (`salt:iv:tag:text`) encrypted payloads and `.enc` files transparently.
* **Atomic Binary File Handling:** Encrypts and decrypts any physical file (images, PDFs, ZIPs, `.env`) with atomic disk writes and overwrite protection (`--force`).
* **Dual Interface (CLI & Interactive):** Fully scriptable via CLI flags or accessible via an ASCII-art interactive menu.
* **Flexible Secret Input & Clipboard Controls:** Prompt-driven key input to prevent shell history leaks, with optional `--no-clipboard` flag.

## 🛡️ Operational Security & AppSec

* **Threat Modeling:** Documented boundaries of protection (See [`THREAT_MODEL.md`](./THREAT_MODEL.md)).
* **Best-Effort Memory Zeroization:** Cryptographic keys are zeroized (`Buffer.fill(0)`) in `finally` blocks immediately after OpenSSL context creation.
* **Explicit Key Derivation (scrypt):** Mitigates GPU/ASIC brute-force attacks using dynamic salts and computationally expensive `scrypt` parameters.
* **Atomic File Writes:** Prevents file corruption by writing output to temporary files before atomic renaming.
* **Automated Security Pipelines:** Protected by GitHub Actions, including **CodeQL (SAST)**, **Dependabot**, and **NPM Audit pipelines**.

---

## 🚀 Getting Started

### Prerequisites
Requires Node.js LTS (v18, v20, or v22).

### Global Installation (Recommended)
```bash
npm install -g @jherostudio/crypto-guardian-cli
```

### Local Development
```bash
git clone https://github.com/Jherostudio/Crypto-Guardian-CLI.git
cd Crypto-Guardian-CLI
npm install
npm run build
npm test
```

---

## 🕹️ Usage Guide

You can run the tool in **Interactive Mode** by typing:
```bash
crypto-guardian
# or locally: npm start
```

### Scripting & Automation (CLI Flags)

**1. Generate a Password:**
```bash
crypto-guardian generate --length 32
# Option --no-clipboard to disable clipboard copy
crypto-guardian generate --length 24 --no-clipboard
```

**2. Audit an Existing Password:**
```bash
crypto-guardian audit --password "MySuperS3cr3t!"
```

**3. Encrypt a Physical File (e.g., `.env`, PDF, ZIP):**
```bash
crypto-guardian encrypt-file --file ./.env --password "master_key_123"
# Use --force to overwrite existing output file
crypto-guardian encrypt-file --file ./document.pdf --force
```

**4. Decrypt a Physical File:**
```bash
crypto-guardian decrypt-file --file ./.env.enc
# Prompt will ask for password securely if --password is omitted
```

**5. Encrypt/Decrypt Raw Text:**
```bash
crypto-guardian encrypt --text "DB_HOST=localhost" --password "key"
crypto-guardian decrypt --cipher "CG01:salt:iv:tag:text" --password "key"
```

---

## 📂 Project Architecture

```text
Crypto-Guardian-CLI/
├── .github/              # CI/CD, CodeQL, Dependabot configs
├── scripts/              # Performance Benchmarking
├── src/
│   ├── index.ts          # CLI Router (Commander) & Interactive Menu
│   ├── entropy.ts        # CSPRNG Generation & Entropy Math
│   ├── cipher.ts         # AES-256-GCM CG01 & Legacy Decrypt Logic
│   └── *.test.ts         # Vitest unit tests
├── Dockerfile            # Multi-stage Non-Root Docker Image
├── THREAT_MODEL.md       # Formal AppSec Threat Model
└── package.json          # v2.0.0 dependencies & scripts
```

---

## 📄 License
This project is open-source and available under the ISC License.

