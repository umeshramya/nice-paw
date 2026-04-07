#!/usr/bin/env node

/**
 * Example script demonstrating the enhanced login tool functionality
 *
 * This shows how the MCP server would be used with the new encryption features.
 * Note: This is a conceptual example - actual usage would be through MCP clients.
 */

console.log('=== Enhanced Login Tool Example ===\n');

console.log('Scenario 1: Plain Login (Backward Compatibility)\n');
console.log('MCP Tool Call:');
console.log(JSON.stringify({
  tool: 'Login',
  arguments: {
    email: 'user@hospital.com',
    password: 'userPassword123'
  }
}, null, 2));

console.log('\nExpected Response:');
console.log(JSON.stringify({
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  user: {
    id: 123,
    email: 'user@hospital.com',
    role: 'staff',
    name: 'Jane Smith',
    username: 'janesmith',
    organizationId: 456,
    organizationName: 'City Hospital',
    mobile: '+1234567890',
    professionalAccess: 'limited',
    uuid: '550e8400-e29b-41d4-a716-446655440001'
  }
}, null, 2));

console.log('\n---\n');

console.log('Scenario 2: Add New Hospital with Encryption\n');
console.log('MCP Tool Call:');
console.log(JSON.stringify({
  tool: 'Login',
  arguments: {
    action: 'add_hospital',
    email: 'admin@generalhospital.com',
    password: 'adminSecurePass789',
    encryptionKey: 'MyMasterKey@2024!Secure',
    hospitalName: 'General Hospital',
    serverUrl: 'https://api.generalhospital.com'
  }
}, null, 2));

console.log('\nExpected Response:');
console.log(JSON.stringify({
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  user: {
    id: 124,
    email: 'admin@generalhospital.com',
    role: 'admin',
    name: 'Dr. John Smith',
    username: 'johnsmith',
    organizationId: 457,
    organizationName: 'General Hospital',
    mobile: '+1234567891',
    professionalAccess: 'full',
    uuid: '550e8400-e29b-41d4-a716-446655440002'
  },
  hospitalProfile: {
    id: 1,
    name: 'General Hospital',
    serverUrl: 'https://api.generalhospital.com',
    email: 'admin@generalhospital.com'
  },
  keyValidated: true
}, null, 2));

console.log('\n---\n');

console.log('Scenario 3: Login with Stored Hospital Profile\n');
console.log('MCP Tool Call:');
console.log(JSON.stringify({
  tool: 'Login',
  arguments: {
    hospitalId: '1',
    encryptionKey: 'MyMasterKey@2024!Secure'
  }
}, null, 2));

console.log('\nExpected Response:');
console.log(JSON.stringify({
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  user: {
    id: 124,
    email: 'admin@generalhospital.com',
    role: 'admin',
    name: 'Dr. John Smith',
    username: 'johnsmith',
    organizationId: 457,
    organizationName: 'General Hospital',
    mobile: '+1234567891',
    professionalAccess: 'full',
    uuid: '550e8400-e29b-41d4-a716-446655440002'
  },
  hospitalProfile: {
    id: 1,
    name: 'General Hospital',
    serverUrl: 'https://api.generalhospital.com',
    email: 'admin@generalhospital.com'
  }
}, null, 2));

console.log('\n---\n');

console.log('Scenario 4: Add Second Hospital (Key Validation)\n');
console.log('MCP Tool Call (with wrong key - should fail):');
console.log(JSON.stringify({
  tool: 'Login',
  arguments: {
    action: 'add_hospital',
    email: 'admin@anotherhospital.com',
    password: 'anotherPass123',
    encryptionKey: 'WrongMasterKey', // Different from first key
    hospitalName: 'Another Hospital',
    serverUrl: 'https://api.anotherhospital.com'
  }
}, null, 2));

console.log('\nExpected Error Response:');
console.log(JSON.stringify({
  error: true,
  message: 'Login failed: Encryption key does not match previously used key',
  type: 'login_error'
}, null, 2));

console.log('\n---\n');

console.log('Database State After Examples:\n');
console.log('File: nice-paw.db');
console.log('Tables:');
console.log('1. hospital_profiles');
console.log('   - id: 1');
console.log('   - name: "General Hospital"');
console.log('   - serverUrl: "https://api.generalhospital.com"');
console.log('   - email: "admin@generalhospital.com"');
console.log('   - encryptedPassword: "<encrypted_data>"');
console.log('   - encryptionSalt: "<random_salt>"');
console.log('   - encryptionIV: "<random_iv>"');
console.log('   - encryptionAuthTag: "<auth_tag>"');
console.log('\n2. key_fingerprint');
console.log('   - id: 1');
console.log('   - keyFingerprint: "sha256_hash_of_MyMasterKey@2024!Secure"');

console.log('\n=== Security Notes ===\n');
console.log('1. Master encryption key is NEVER stored');
console.log('2. Only key fingerprint (SHA-256 hash) is stored for validation');
console.log('3. Each hospital password is encrypted with unique salt and IV');
console.log('4. AES-256-GCM provides both encryption and integrity verification');
console.log('5. PBKDF2 with 100,000 iterations for key derivation');
console.log('6. SQLite database is local to the user\'s machine');

console.log('\n=== Usage Instructions ===\n');
console.log('1. Start the MCP server:');
console.log('   npm run build && node dist/index.js');
console.log('\n2. Connect an MCP client (Claude Desktop, Cursor, etc.)');
console.log('\n3. Use the Login tool with appropriate parameters');
console.log('\n4. For hospital management, use encryptionKey consistently');

console.log('\n=== Next Steps (Phase 2) ===\n');
console.log('1. Add hospital profile management tools:');
console.log('   - ListHospitalProfiles');
console.log('   - DeleteHospitalProfile');
console.log('   - UpdateHospitalProfile');
console.log('\n2. Add encryption test tools:');
console.log('   - EncryptText');
console.log('   - DecryptText');
console.log('\n3. Add PostgreSQL support for production');
console.log('\n4. Add configuration management');