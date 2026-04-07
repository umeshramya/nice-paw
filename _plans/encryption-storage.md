# Implementation Plan: Add Encryption and Password Storage to MCP Login Tool

## Status: ✅ COMPLETED

**Date**: 2026-04-07
**Project**: nice-paw MCP Server
**Location**: Project root directory (D:\nice-paw\IMPLEMENTATION_PLAN.md)

## Overview

The encryption and password storage system has been successfully implemented and is fully operational. The system supports:

1. **Master Encryption Key**: Single encryption key used for all hospital passwords
2. **Encrypted Password Storage**: Passwords encrypted before storage using user-provided encryption key
3. **Key Validation**: Validate encryption key when adding new hospital (email+password+key)
4. **Multiple Hospital Support**: Store credentials for multiple hospitals/organizations
5. **Encryption Key Management**: Encryption key provided by user when needed, not stored persistently
6. **Login Tool Enhancement**: Login tool handles encryption/decryption and returns JWT token
7. **Database**: SQLite for development (PostgreSQL support can be added for production)

## Implementation Details

### ✅ Phase 1: Core Encryption & Login Enhancement

#### 1. **Encryption Utilities** (`src/encryption.ts`)
- `encryptPassword(password: string, masterKey: string): Promise<EncryptedData>`
- `decryptPassword(encryptedData: EncryptedData, masterKey: string): Promise<string>`
- `generateKeyFingerprint(masterKey: string): string` - SHA-256 hash
- `validateKeyFingerprint(masterKey: string, storedFingerprint: string): boolean`
- `testEncryption(password: string, masterKey: string): Promise<boolean>`
- **Security**: AES-256-GCM with PBKDF2 key derivation (100,000 iterations)

#### 2. **Storage Module** (`src/storage.ts`)
- **Database**: SQLite with `better-sqlite3`
- **Tables**:
  - `hospital_profiles`: `id`, `name`, `serverUrl`, `email`, `encryptedPassword`, `encryptionSalt`, `encryptionIV`, `encryptionAuthTag`, `createdAt`, `updatedAt`
  - `key_fingerprint`: `id`, `keyFingerprint` (SHA-256 hash of master key), `createdAt` (single row)
- **Operations**: CRUD for hospital profiles, key fingerprint management
- **Singleton Pattern**: `storage` export for shared instance

#### 3. **Enhanced Login Tool** (`src/login.ts`)
**Three Authentication Modes:**
1. **Plain Login** (backward compatibility): Email + password
2. **Add Hospital**: Email + password + encryptionKey + hospitalName (stores encrypted credentials)
3. **Stored Login**: hospitalId + encryptionKey (retrieves and decrypts stored credentials)

**Key Features:**
- Uses `authenticateWithAPI()` function to call healthcare API
- Supports encryption key validation via SHA-256 fingerprint
- Encrypts passwords using AES-256-GCM with PBKDF2 key derivation
- Stores hospital profiles in SQLite database
- Returns structured JSON response with token, user data, and hospital profile

**Schema Validation:**
- Uses Zod for input validation (`loginToolSchema`)
- Defines expected output structure (`loginToolOutputSchema`)

#### 4. **MCP Server** (`src/index.ts`)
- Server name: `nice-paw`, version: `1.1.0`
- Uses `StdioServerTransport` for communication
- Registers a single `Login` tool with enhanced functionality

### ✅ Phase 2: Testing & Examples

#### 1. **Test Files**
- `src/test-encryption.ts`: Encryption module tests
- `src/test-login-integration.ts`: Login integration tests
- `examples/enhanced-login-example.js`: Example usage documentation

#### 2. **Example Usage**
```javascript
// First-time setup: Add hospital with master key
const result1 = await loginTool({
  action: 'add_hospital',
  email: 'admin@hospital1.com',
  password: 'securePassword123',
  encryptionKey: 'myMasterKey123!',
  hospitalName: 'General Hospital',
  serverUrl: 'https://api.hospital1.com'
});

// Subsequent login: Use stored hospital profile
const result2 = await loginTool({
  hospitalId: '1',
  encryptionKey: 'myMasterKey123!'
});

// Plain login (backward compatibility)
const result3 = await loginTool({
  email: 'admin@hospital2.com',
  password: 'anotherPassword456'
});
```

### ✅ Phase 3: Security Implementation

#### 1. **Key Management**
- **Never stores master key** - only SHA-256 fingerprint
- **Unique salt and IV** for each encryption
- **AES-256-GCM** for authenticated encryption
- **PBKDF2 with 100,000 iterations** for key derivation

#### 2. **Database Security**
- **Local SQLite database** - credentials stay on user's machine
- **Unique constraints** on email+serverUrl to prevent duplicates
- **Indexes** for efficient querying

## Architecture

### File Structure
```
src/
├── index.ts              # MCP server entry point
├── login.ts              # Enhanced login tool with encryption
├── encryption.ts         # AES-256-GCM encryption utilities
├── storage.ts            # SQLite database storage
├── test-encryption.ts    # Encryption tests
└── test-login-integration.ts # Integration tests

examples/
└── enhanced-login-example.js # Usage examples
```

### Database Schema
```sql
-- hospital_profiles table
CREATE TABLE hospital_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  serverUrl TEXT NOT NULL,
  email TEXT NOT NULL,
  encryptedPassword TEXT NOT NULL,
  encryptionSalt TEXT NOT NULL,
  encryptionIV TEXT NOT NULL,
  encryptionAuthTag TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email, serverUrl)
);

-- key_fingerprint table (single row)
CREATE TABLE key_fingerprint (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  keyFingerprint TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Flow

### 1. **First Hospital Setup**
```
User → Provides email, password, encryptionKey, hospitalName
System → Validates key (no fingerprint yet)
        → Encrypts password with master key
        → Stores hospital profile
        → Stores key fingerprint (SHA-256 hash)
        → Authenticates with API
        → Returns token + hospital profile
```

### 2. **Subsequent Hospital Addition**
```
User → Provides email, password, encryptionKey, hospitalName
System → Validates key against stored fingerprint
        → Encrypts password with master key
        → Stores hospital profile
        → Authenticates with API
        → Returns token + hospital profile
```

### 3. **Stored Hospital Login**
```
User → Provides hospitalId, encryptionKey
System → Retrieves hospital profile
        → Decrypts password with master key
        → Authenticates with API
        → Returns token + hospital profile
```

### 4. **Plain Login (Backward Compatibility)**
```
User → Provides email, password
System → Authenticates with API
        → Returns token + user data
```

## Security Considerations

### ✅ Implemented
1. **Master Key Protection**: Only SHA-256 fingerprint stored, never the key itself
2. **Strong Encryption**: AES-256-GCM with authenticated encryption
3. **Key Derivation**: PBKDF2 with 100,000 iterations for key stretching
4. **Unique Parameters**: Random salt and IV for each encryption
5. **Local Storage**: Credentials stored only on user's machine
6. **Key Validation**: Ensures same master key used for all hospitals

### 🔄 Future Enhancements
1. **PostgreSQL Support**: For production deployments
2. **Additional Hospital Management Tools**: List, update, delete profiles
3. **Encryption Test Tools**: Encrypt/decrypt arbitrary text
4. **Configuration Management**: Environment-based configuration
5. **Enhanced Error Handling**: More specific error messages

## Testing

### Unit Tests
- Encryption/decryption cycle validation
- Key fingerprint generation and validation
- Database operations (CRUD)

### Integration Tests
- Full login flow with encryption
- Key validation scenarios
- Error handling for invalid keys

### Manual Testing
1. Add first hospital with master key
2. Add second hospital with same master key (should validate)
3. Add hospital with different master key (should fail validation)
4. Login with stored hospital credentials
5. Plain login (backward compatibility)

## Dependencies

### Core Dependencies
- `@modelcontextprotocol/server`: MCP server implementation
- `better-sqlite3`: SQLite database
- `dotenv`: Environment variable management
- `zod`: Schema validation

### Development Dependencies
- TypeScript, Jest, ts-jest for testing
- `@types/*` for TypeScript definitions

## Build & Run

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Development mode (watch for changes)
npm run dev
```

## Next Steps (Optional Enhancements)

### 1. **Hospital Profile Management Tools**
- `ListHospitalProfiles`: List all stored hospital profiles
- `DeleteHospitalProfile`: Remove hospital profile
- `UpdateHospitalProfile`: Update hospital details

### 2. **Encryption Test Tools**
- `EncryptText`: Tool to encrypt arbitrary text with master key
- `DecryptText`: Tool to decrypt text with master key

### 3. **Production Database Support**
- PostgreSQL adapter for production deployments
- Environment variable to switch between SQLite/PostgreSQL

### 4. **Configuration & Error Handling**
- Validate encryption key strength requirements
- More specific error messages for decryption failures
- Hospital profile not found errors

## Verification Checklist

- [x] Run `npm run build` to compile TypeScript
- [x] Test login tool via MCP client: add new hospital with master key
- [x] Test login with stored hospital credentials using same master key
- [x] Verify backward compatibility: plain email/password login still works
- [x] Test key validation: wrong key should fail for new hospital addition
- [x] Verify encryption/decryption cycle works correctly
- [x] Check database schema and indexes are created properly
- [x] Validate error handling for invalid keys and missing parameters

## Notes

- **Plan Location**: This plan is stored in the project root directory (`IMPLEMENTATION_PLAN.md`) as requested
- **Original Plan**: The implementation follows the original plan from `C:\Users\ASUS\.claude\plans\distributed-enchanting-fountain.md`
- **Completion Date**: 2026-04-07
- **Status**: All core functionality implemented and tested

## Credits

Implementation completed by Claude Code with the enhanced login tool, encryption system, and SQLite storage module fully operational.