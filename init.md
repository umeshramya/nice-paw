# Project Initialization

**Project**: nice-paw MCP Server
**Date**: 2026-04-07
**Status**: ✅ Active

## Overview

This document serves as the project initialization and setup guide for the nice-paw MCP server project. The project implements a Model Context Protocol (MCP) server for healthcare authentication with enhanced encryption and password storage capabilities.

## Project Structure

```
nice-paw/
├── src/                    # TypeScript source code
│   ├── index.ts           # MCP server entry point
│   ├── login.ts           # Enhanced login tool with encryption
│   ├── encryption.ts      # AES-256-GCM encryption utilities
│   ├── storage.ts         # SQLite database storage
│   ├── test-encryption.ts # Encryption tests
│   └── test-login-integration.ts # Integration tests
├── _plans/                # Implementation plans and design docs
│   ├── README.md          # Plans directory documentation
│   └── encryption-storage.md # Encryption implementation plan
├── examples/              # Usage examples
│   └── enhanced-login-example.js
├── bin/                   # CLI entry point
│   └── nice-paw.js
├── dist/                  # Compiled output (gitignored)
├── node_modules/          # Dependencies (gitignored)
├── nice-paw.db           # SQLite database (gitignored)
├── init.md               # This initialization document
├── README.md             # Project overview
├── CLAUDE.md             # Claude Code project instructions
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── jest.config.mjs       # Jest test configuration
└── .env                  # Environment variables (gitignored)
```

## Current State

### ✅ Completed Implementation

The project has successfully implemented:

1. **Enhanced Login Tool** (`src/login.ts`):
   - Three authentication modes: plain login, add hospital, stored login
   - Master encryption key support with key validation
   - AES-256-GCM encryption with PBKDF2 key derivation
   - SQLite database storage for hospital profiles

2. **Encryption System** (`src/encryption.ts`):
   - `encryptPassword()`: AES-256-GCM encryption
   - `decryptPassword()`: Secure decryption with authentication
   - `generateKeyFingerprint()`: SHA-256 hash for key validation
   - `validateKeyFingerprint()`: Master key consistency check

3. **Storage Module** (`src/storage.ts`):
   - SQLite database with `better-sqlite3`
   - Hospital profiles table with encrypted credentials
   - Key fingerprint table for master key validation
   - CRUD operations for profile management

4. **MCP Server** (`src/index.ts`):
   - Server name: `nice-paw`, version: `1.1.0`
   - `StdioServerTransport` for communication
   - Single `Login` tool with enhanced functionality

### 🔄 Available for Enhancement

1. **Hospital Profile Management Tools**:
   - List, update, delete hospital profiles
   - Profile search and filtering

2. **Encryption Test Tools**:
   - Encrypt/decrypt arbitrary text
   - Key strength validation

3. **Production Database Support**:
   - PostgreSQL adapter
   - Environment-based database switching

4. **Configuration Management**:
   - Enhanced error handling
   - Configuration validation

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- TypeScript (installed via npm)

### Installation
```bash
# Clone the repository (if applicable)
# git clone <repository-url>
# cd nice-paw

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Configuration
1. **Environment Variables** (`.env`):
   ```
   SERVER_URL=https://api.nicehms.com
   # Add other configuration as needed
   ```

2. **Database**: SQLite database (`nice-paw.db`) is created automatically

### Build & Development
```bash
# Build TypeScript
npm run build

# Development mode (watch for changes)
npm run dev

# Run tests
npm test

# Test with coverage
npm run test:coverage
```

## Usage Examples

### 1. First-time Hospital Setup
```javascript
const result = await loginTool({
  action: 'add_hospital',
  email: 'admin@hospital.com',
  password: 'securePassword123',
  encryptionKey: 'myMasterKey123!',
  hospitalName: 'General Hospital',
  serverUrl: 'https://api.hospital.com'
});
```

### 2. Stored Hospital Login
```javascript
const result = await loginTool({
  hospitalId: '1',
  encryptionKey: 'myMasterKey123!'
});
```

### 3. Plain Login (Backward Compatibility)
```javascript
const result = await loginTool({
  email: 'admin@hospital.com',
  password: 'securePassword123'
});
```

## Security Considerations

### Implemented Security Features
1. **Master Key Protection**: Only SHA-256 fingerprint stored, never the key
2. **Strong Encryption**: AES-256-GCM with authenticated encryption
3. **Key Derivation**: PBKDF2 with 100,000 iterations
4. **Unique Parameters**: Random salt and IV for each encryption
5. **Local Storage**: Credentials stored only on user's machine
6. **Key Validation**: Ensures same master key used for all hospitals

### Security Best Practices
- Use strong master keys (minimum 16 characters, mixed case, numbers, symbols)
- Never share master keys or store them in version control
- Regularly update passwords for stored hospital profiles
- Monitor database access and permissions

## Testing

### Available Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage
- Unit tests for encryption utilities
- Integration tests for login flow
- Database operation tests
- Error handling tests

## Documentation

### Project Documentation
- `README.md`: Project overview and usage
- `CLAUDE.md`: Claude Code project instructions
- `_plans/`: Implementation plans and design documents
- `examples/`: Usage examples and demonstrations

### Code Documentation
- TypeScript type definitions and interfaces
- JSDoc comments for public APIs
- Inline comments for complex logic

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/feature-name

# Implement changes
# Write tests
# Update documentation

# Test changes
npm test
npm run build

# Commit changes
git add .
git commit -m "feat: description of changes"
```

### 2. Code Review
- Ensure all tests pass
- Verify TypeScript compilation
- Check code style and consistency
- Update documentation as needed

### 3. Deployment
```bash
# Build for production
npm run build

# Publish to npm (if applicable)
npm publish
```

## Maintenance

### Regular Tasks
1. **Dependency Updates**: Regularly update npm dependencies
2. **Security Audits**: Review encryption and security implementation
3. **Performance Monitoring**: Monitor database and API performance
4. **Backup Strategy**: Implement database backup procedures

### Issue Tracking
- Use GitHub Issues for bug reports and feature requests
- Document known issues and workarounds
- Maintain changelog for version updates

## Support

### Getting Help
1. **Documentation**: Check `README.md` and `examples/`
2. **Issues**: Report bugs via GitHub Issues
3. **Community**: Engage with MCP community for support

### Troubleshooting
- Check `.env` configuration
- Verify database permissions
- Review error logs and console output
- Test with minimal configuration

## Contributing

### Guidelines
1. Follow existing code style and patterns
2. Write tests for new functionality
3. Update documentation for changes
4. Use descriptive commit messages

### Code Style
- TypeScript with strict mode enabled
- ESLint configuration (if applicable)
- Prettier formatting (if applicable)

## License & Attribution

Check `package.json` and `LICENSE` file for licensing information.

---

**Last Updated**: 2026-04-07
**Maintainer**: Project Team
**Status**: ✅ Active and Maintained