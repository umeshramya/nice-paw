<img src="https://raw.githubusercontent.com/umeshramya/nice-paw/main/nice-paw.png" alt="nice-paw logo" width="200" />

# nice-paw

An MCP (Model Context Protocol) server for **https://www.nicehms.com** healthcare systems, providing authentication tools for integration with Claude Code and other MCP clients.

> ⚠️ Currently includes a demo login tool with hardcoded credentials (for development/testing only).

---

## 🚀 Features

* 🔐 Login tool (email + password)
* ⚡ MCP stdio-based server
* 🧠 Zod-based input validation
* 🧪 Jest test coverage
* 📦 CLI support via `nice-paw` command
* 🧩 Easy integration with Claude Code

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

### 🔐 Login Tool

Authenticate using email and password.

#### Example (Demo Credentials)

```
email: admin@example.com
password: password
```

#### Example Response

```json
{
  "content": [
    {
      "type": "text",
      "text": "Login successful"
    }
  ]
}
```

> ⚠️ Replace demo logic with real authentication in `src/login.ts` for production.

---

## 🏗 Project Structure

```
nice-paw/
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── login.ts          # Login tool implementation
│   └── __tests__/        # Jest test files
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
