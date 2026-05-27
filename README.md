# Crypto Guardian CLI 🛡️

<div align="center">
  <img src="demo.gif" alt="Crypto Guardian CLI Demo" width="800"/>
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/@jherostudio/crypto-guardian-cli"><img src="https://img.shields.io/npm/v/@jherostudio/crypto-guardian-cli?style=flat-square&color=blue" alt="npm version"></a>
  <a href="https://github.com/Jherostudio/Crypto-Guardian-CLI/actions"><img src="https://img.shields.io/github/actions/workflow/status/Jherostudio/Crypto-Guardian-CLI/ci.yml?style=flat-square" alt="CI Status"></a>
  <a href="https://github.com/Jherostudio/Crypto-Guardian-CLI/security/code-scanning"><img src="https://img.shields.io/github/actions/workflow/status/Jherostudio/Crypto-Guardian-CLI/codeql.yml?label=CodeQL&style=flat-square" alt="CodeQL Status"></a>
  <img src="https://img.shields.io/badge/Security-AES--256--GCM-success?style=flat-square" alt="Security Standard">
</p>

A professional, secure, and highly automated Command Line Interface (CLI) tool designed for robust cryptographic operations. Built natively in TypeScript, it leverages hardware-backed cryptography to generate high-entropy passwords, perform authenticated symmetric encryption on files and strings, and manage memory securely via zeroization.

Developed under strict engineering and AppSec standards by **Jhero Studio**.

---

## ⚡ Key Features

* **High-Entropy Password Generation:** Generates cryptographically secure random passwords using OS-level CSPRNG (`node:crypto`).
* **Shannon Entropy Auditing:** Real-time mathematical evaluation of password strength ($E = L \cdot \log_2(R)$) to classify security levels up to `EXTREMA` status (>80 bits).
* **Advanced Data & File Encryption (AES-256-GCM):** Industry-standard symmetric encryption to secure physical files (like `.env`) or raw text strings.
* **Authenticated Decryption:** Utilizes Galois/Counter Mode (GCM) authentication tags to strictly prevent Bit-Flipping attacks and unauthorized data tampering.
* **Dual Interface (CLI & Interactive):** Fully scriptable via command-line flags or accessible via an immersive ASCII-art interactive menu.
* **Automatic Clipboard Integration:** Smooth Developer Experience (DX) that safely copies generated secrets to your OS clipboard.

## 🛡️ Operational Security & AppSec (DevSecOps)

* **Threat Modeling:** Documented boundaries of protection (See [`THREAT_MODEL.md`](./THREAT_MODEL.md)).
* **Secure Memory Wiping (Zeroization):** Derived cryptographic keys are forcefully zeroized (`Buffer.fill(0)`) from V8/RAM immediately after OpenSSL context initialization to prevent memory scraping.
* **Key Derivation (scrypt):** Mitigates brute-force and ASIC attacks using dynamic salts and computationally expensive scrypt parameters.
* **Automated Security Pipelines:** Protected by GitHub Actions, including **CodeQL (SAST)**, **Dependabot**, and **NPM Audit pipelines**.
* **Automated Testing:** Cryptographic integrity and entropy logic covered by `vitest`.

---

## 🚀 Getting Started

### Prerequisites
Requires Node.js LTS (v18, v20, or v22).

### Global Installation (Recommended)
You can install the CLI globally via NPM or GitHub Packages to use it from anywhere in your terminal:

```bash
npm install -g @jherostudio/crypto-guardian-cli
```

### Local Development
```bash
git clone https://github.com/Jherostudio/Crypto-Guardian-CLI.git
cd Crypto-Guardian-CLI
npm install
npm run build
```

---

## 🕹️ Usage Guide

You can run the tool in **Interactive Mode** by simply typing:
```bash
crypto-guardian
# or locally: npm start
```

### Scripting & Automation (CLI Flags)

The CLI is fully scriptable for CI/CD environments or bash scripts:

**1. Generate a Password (automatically copied to clipboard):**
```bash
feature/enterprise-upgrade
crypto-guardian generate --length 32
```

**2. Audit an Existing Password:**
```bash
crypto-guardian audit --password "MySuperS3cr3t!"
```

**3. Encrypt a Physical File (e.g., `.env`):**
```bash
crypto-guardian encrypt-file --file ./.env --password "master_key_123"
# Outputs: .env.enc
```

**4. Decrypt a Physical File:**
```bash
crypto-guardian decrypt-file --file ./.env.enc --password "master_key_123"
# Outputs: .env.decrypted
```

**5. Encrypt/Decrypt Raw Text:**
```bash
crypto-guardian encrypt --text "DB_HOST=localhost" --password "key"
crypto-guardian decrypt --cipher "salt:iv:tag:text" --password "key"
```

---

## 📂 Project Architecture

```text
Crypto-Guardian-CLI/
├── .github/              # CI/CD, CodeQL, Dependabot configs
├── scripts/              # Performance Benchmarking (vitest bench)
├── src/
│   ├── index.ts          # CLI Router (Commander) & Interactive Menu
│   ├── entropy.ts        # CSPRNG Generation & Shannon Math
│   ├── cipher.ts         # AES-GCM logic & Zeroization
│   └── *.test.ts         # Vitest unit tests
├── THREAT_MODEL.md       # Formal AppSec Threat Model
└── .release-it.json      # Automated semantic versioning
```

---

```
Plaintext
47e188f79133dbe...61f2aa3f58f8800cd3932a1242
```
---

## 📄 License
This project is open-source and proudly developed by **Jhero Studio**. It is available under the **MIT License**.
