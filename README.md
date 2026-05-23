# Crypto Guardian CLI 🛡️

<a href="https://www.npmjs.com/package/crypto-guardian-cli">
  <img src="https://img.shields.io/npm/v/crypto-guardian-cli?style=flat-square" alt="npm version">
</a>

A lightweight, secure, and interactive Command Line Interface (CLI) tool designed for cryptographic operations. Built natively in TypeScript and Node.js, it leverages hardware-backed cryptography to generate high-entropy military-grade passwords and securely encrypt sensitive data using advanced encryption standards.

Developed under the engineering standards of **Jhero Studio**.

---

## ⚡ Features

* **Military-Grade Password Generation:** Generates cryptographically secure random passwords using hardware entropy (`node:crypto`).
* **Shannon Entropy Calculation:** Real-time mathematical evaluation of password strength ($E = L \cdot \log_2(R)$) to classify security levels up to `MILITAR` status (>80 bits).
* **Advanced Data Encryption (AES-256-GCM):** Industry-standard symmetric encryption to secure `.env` files, API keys, or raw text blocks.
* **Authenticated Decryption:** Utilizes Galois/Counter Mode (GCM) authentication tags to prevent data tampering or unauthorized modifications.
* **Interactive Cyberpunk UI:** A clean, zero-dependency interactive console menu driven by the native Node.js `readline` module.

---

## 📂 Project Architecture

```text
crypto-guardian-cli/
├── src/
│   ├── index.ts          # Main interactive CLI menu loop
│   ├── entropy.ts        # Password generation & Shannon entropy logic
│   ├── cipher.ts         # AES-256-GCM encryption & decryption modules
│   └── ui.ts             # Console aesthetics and color handling
├── package.json          # Dependencies & project scripts
├── tsconfig.json         # TypeScript compiler configuration
└── README.md             # Project documentation
```
---

🛠️ TECHNICAL STACK & SECURITY IMPLEMENTATION

- Runtime & Language: Node.js v23+ & TypeScript.
- Development Engine: tsx for high-performance, real-time TypeScript execution.
- Cryptographic Core: Native node:crypto using secure pseudo-random number generators (CSPRNG) via hardware.
- Key Derivation: scryptSync with a unique dynamic salt per session to mitigate rainbow table attacks.
- Commit Verification: 100% of the codebase is cryptographically signed with trusted GPG keys (Verified status).

---

🚀 GETTING STARTED

Prerequisites
Ensure you have Node.js installed on your machine (v23 or higher recommended).

Installation
1.  Clone repository
 ```bash
git clone https://github.com/Jherostudio/crypto-guardian-cli.git
cd crypto-guardian-cli
```
2.  Install dependencies

```bash
npm install
```

3.  Run the application

```bash
npx tsx src/index.ts
```
---

🕹️ USAGE SHOWCASE

1. Generating a Secure Key
Choose option 1, enter your desired length (e.g., 16), and the system will output your password along with its calculated mathematical resistance:

```bash
Plaintext
✅ Generada: L9jMKP$<#PHmQ@{$
📊 Entropía: 104.87 bits [MILITAR]
```

2. Encrypting Sensitive Data

Choose option 2, paste your data (such as raw database credentials), and establish a master phrase. The output is a secure payload structure containing salt:iv:authTag:cipherText:


```bash
Plaintext
47e188f79133dbe...61f2aa3f58f8800cd3932a1242
```

---

📄 LICENSE
This project is open-source and available under the MIT License.
 
