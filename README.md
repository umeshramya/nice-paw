<img src="https://raw.githubusercontent.com/umeshramya/nice-paw/main/nice-paw.png" alt="nice-paw logo" width="200" />

# nice-paw

An MCP (Model Context Protocol) server for **https://www.nicehms.com** healthcare systems, providing authentication tools for integration with Claude Code and other MCP clients.

> ⚠️ Currently includes a demo login tool with hardcoded credentials (for development/testing only).

---

## 🚀 Features

* 🔐 Enhanced Login tool with multiple authentication modes
* 🔒 Password encryption with master key support
* 🏥 Hospital profile management with encrypted storage
* ⚡ MCP stdio-based server
* 🧠 Zod-based input validation
* 🧪 Jest test coverage
* 📦 CLI support via `nice-paw` command
* 🧩 Easy integration with Claude Code
* 💾 SQLite database for local credential storage
* 🔑 AES-256-GCM encryption with PBKDF2 key derivation

---

## 📦 Installation

### 1. Global Install (Recommended)

```bash
npm install -g nice-paw
```

This makes the `nice-paw` CLI available system-wide.

---

### 2. Run Without Installing (npx)

```bash
npx nice-paw
```

---

### 3. From Source (Development)

```bash
git clone https://github.com/umeshramya/nice-paw.git
cd nice-paw

npm install
npm run build
```

---

### 4. Local CLI Testing

```bash
npm install -g .
```

---

## 🔌 Connecting to Claude Code

After installation, configure MCP in Claude Code.

### ✅ Global Installation

Add to:

```
~/.config/claude-code/config.json
```

```json
{
  "mcpServers": {
    "nice-paw": {
      "command": "nice-paw"
    }
  }
}
```

---

### 🛠 Local Development

```json
{
  "mcpServers": {
    "nice-paw": {
      "command": "node",
      "args": ["/absolute/path/to/nice-paw/bin/nice-paw.js"]
    }
  }
}
```

---

### ⚡ Using npx

```json
{
  "mcpServers": {
    "nice-paw": {
      "command": "npx",
      "args": ["nice-paw"]
    }
  }
}
```

---

## 🧪 Usage

Once connected, Claude Code will expose available tools.

### 🔐 Enhanced Login Tool

The login tool now supports three authentication modes with encrypted password storage:

#### 1. Plain Login (Backward Compatibility)
Authenticate using email and password directly.

```json
{
  "email": "user@hospital.com",
  "password": "userPassword123"
}
```

#### 2. Add New Hospital with Encryption
Store hospital credentials with encrypted password using a master key.

```json
{
  "action": "add_hospital",
  "email": "admin@hospital.com",
  "password": "adminPassword456",
  "encryptionKey": "MyMasterKey@2024!Secure",
  "hospitalName": "General Hospital",
  "serverUrl": "https://api.hospital.com"
}
```

#### 3. Login with Stored Hospital Profile
Authenticate using stored hospital credentials (password is decrypted with master key).

```json
{
  "hospitalId": "1",
  "encryptionKey": "MyMasterKey@2024!Secure"
}
```

#### Example Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "email": "admin@hospital.com",
    "role": "admin",
    "name": "John Doe",
    "username": "johndoe",
    "organizationId": 456,
    "organizationName": "General Hospital",
    "mobile": "+1234567890",
    "professionalAccess": "full",
    "uuid": "550e8400-e29b-41d4-a716-446655440000"
  },
  "hospitalProfile": {
    "id": 1,
    "name": "General Hospital",
    "serverUrl": "https://api.hospital.com",
    "email": "admin@hospital.com"
  },
  "keyValidated": true
}
```

### 🔒 Encryption & Security Features

- **Master Key Encryption**: Single encryption key for all hospital passwords
- **Key Validation**: SHA-256 fingerprint ensures consistent key usage
- **AES-256-GCM**: Military-grade encryption with authentication
- **PBKDF2**: 100,000 iterations for key derivation
- **Unique Salt/IV**: Each password encrypted with unique parameters
- **Local Storage**: SQLite database (nice-paw.db) stores encrypted credentials
- **No Key Storage**: Master key is never stored, only its fingerprint

### 🏥 Hospital Profile Management

- Store multiple hospital credentials securely
- Each profile includes: name, server URL, email, encrypted password
- Automatic key validation when adding new hospitals
- Backward compatible with plain login mode

---

## 🏗 Project Structure

```
nice-paw/
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── login.ts          # Enhanced login tool with encryption
│   ├── encryption.ts     # AES-256-GCM encryption utilities
│   ├── storage.ts        # SQLite database for hospital profiles
│   ├── test-encryption.ts # Encryption/storage test script
│   ├── test-login-integration.ts # Integration test examples
│   └── __tests__/        # Jest test files
│
├── examples/
│   └── enhanced-login-example.js # Usage examples
│
├── bin/
│   └── nice-paw.js       # CLI entry (executes compiled server)
│
├── dist/                 # Compiled output (generated)
├── jest.config.mjs       # Jest configuration (ESM)
├── tsconfig.json         # TypeScript config
└── package.json
```

---

## ⚙️ Requirements

* Node.js **18+**
* npm

---

## 🧠 MCP Architecture

This project uses:

* `@modelcontextprotocol/server`
* Transport: **stdio**
* Tool registration via:

```ts
server.registerTool(...)
```

The server communicates with MCP clients (like Claude Code) over standard input/output.

---

## ➕ Adding New Tools

1. Create a tool file:

   ```
   src/new-tool.ts
   ```

2. Define a Zod schema:

   ```ts
   z.object({ ... })
   ```

3. Register the tool in:

   ```
   src/index.ts
   ```

4. Add tests:

   ```
   src/__tests__/new-tool.test.ts
   ```

---

## 🛠 Development

### Install Dependencies

```bash
npm install
```

---

### Build

```bash
npm run build
```

---

### Watch Mode

```bash
npm run dev
```

---

### Run Server (Compiled)

```bash
npm start
```

---

### Run Without Build (Dev)

```bash
npx tsx src/index.ts
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Test encryption module
npm run build && node dist/test-encryption.js

# View integration examples
node dist/test-login-integration.js
```

---

## 📦 Publishing

```bash
npm run build
npm publish
```

Before publishing:

* Update version in `package.json`
* Ensure `dist/` is generated

---

## 🛠 Troubleshooting

### ❌ Server Not Starting

```bash
node dist/index.js
```

If this fails → fix build/runtime first.

---

### ❌ Claude Code Not Detecting Server

* Restart Claude Code
* Validate config JSON
* Verify command path
* Use absolute paths in dev mode

---

### ❌ ESM Errors

Ensure:

```json
"type": "module"
```

And imports use `.js`:

```ts
import { server } from './index.js';
```

---

### ❌ Tests Failing

```bash
npm test -- --config jest.config.mjs
```

---

## 🔐 Production Notes

This project currently uses **mock authentication**.

To make production-ready:

* Replace login logic with API call
* Add JWT handling
* Secure credential flow
* Add refresh tokens

---

## 📄 License

ISC
