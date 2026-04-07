#!/usr/bin/env node

/**
 * Setup script for nice-paw MCP server
 *
 * This script helps initialize the project for first-time use.
 * Run with: node setup.js
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 nice-paw MCP Server Setup');
console.log('============================\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
if (majorVersion < 18) {
  console.error(`❌ Node.js version ${nodeVersion} detected.`);
  console.error('   This project requires Node.js 18 or higher.');
  console.error('   Please upgrade Node.js and try again.');
  process.exit(1);
}
console.log(`✅ Node.js ${nodeVersion} (requires 18+)`);

// Check if package.json exists
if (!existsSync(join(__dirname, 'package.json'))) {
  console.error('❌ package.json not found. Are you in the correct directory?');
  process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
console.log(`✅ Project: ${packageJson.name} v${packageJson.version}`);

// Create necessary directories
const directories = [
  'dist',
  'examples',
  '_plans'
];

console.log('\n📁 Creating directories...');
directories.forEach(dir => {
  const dirPath = join(__dirname, dir);
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    console.log(`   Created: ${dir}/`);
  } else {
    console.log(`   Exists: ${dir}/`);
  }
});

// Check for .env file
const envPath = join(__dirname, '.env');
if (!existsSync(envPath)) {
  console.log('\n⚙️  Creating .env file...');
  const envTemplate = `# nice-paw MCP Server Configuration
# =================================

# Healthcare API server URL
# Default: https://www.nicehms.com
SERVER_URL=https://www.nicehms.com

# Database configuration (SQLite)
# SQLite database file will be created automatically
# DATABASE_URL=sqlite:./nice-paw.db

# Logging level (debug, info, warn, error)
LOG_LEVEL=info

# Encryption settings
# PBKDF2 iterations (default: 100000)
# ENCRYPTION_ITERATIONS=100000

# Development mode
# NODE_ENV=development

# Notes:
# 1. The SERVER_URL should point to your healthcare API endpoint
# 2. For production, consider using PostgreSQL instead of SQLite
# 3. Never commit .env file to version control
`;
  writeFileSync(envPath, envTemplate);
  console.log('   Created .env file with default configuration');
  console.log('   ⚠️  Please edit .env to configure your server URL');
} else {
  console.log('\n✅ .env file already exists');
}

// Check for example files
const examplePath = join(__dirname, 'examples', 'enhanced-login-example.js');
if (!existsSync(examplePath)) {
  console.log('\n📝 Creating example files...');
  const exampleContent = `/**
 * Enhanced Login Example for nice-paw MCP Server
 *
 * This example demonstrates the three authentication modes:
 * 1. Plain login (backward compatibility)
 * 2. Add hospital with encrypted credentials
 * 3. Login with stored hospital profile
 */

// Note: This is a conceptual example. In practice, you would use
// the MCP client to call the Login tool.

console.log('nice-paw MCP Server - Enhanced Login Examples');
console.log('=============================================\\n');

// Example 1: Plain Login (backward compatibility)
const plainLoginExample = {
  mode: 'Plain Login',
  description: 'Simple email/password authentication',
  parameters: {
    email: 'admin@hospital.com',
    password: 'securePassword123'
  },
  notes: 'No encryption key required. Returns JWT token and user data.'
};

// Example 2: Add Hospital with Encrypted Credentials
const addHospitalExample = {
  mode: 'Add Hospital',
  description: 'Store hospital credentials with encryption',
  parameters: {
    action: 'add_hospital',
    email: 'admin@hospital1.com',
    password: 'hospitalPassword123',
    encryptionKey: 'myMasterKey123!',
    hospitalName: 'General Hospital',
    serverUrl: 'https://api.hospital1.com'
  },
  notes: 'Requires master encryption key. Encrypts and stores credentials for future use.'
};

// Example 3: Login with Stored Hospital Profile
const storedLoginExample = {
  mode: 'Stored Login',
  description: 'Login using stored encrypted credentials',
  parameters: {
    hospitalId: '1',
    encryptionKey: 'myMasterKey123!'
  },
  notes: 'Requires hospital ID and same master key used during registration.'
};

console.log('Available Authentication Modes:');
console.log('--------------------------------');
console.log(\`1. \${plainLoginExample.mode}\`);
console.log(\`   \${plainLoginExample.description}\`);
console.log(\`   Parameters: \${JSON.stringify(plainLoginExample.parameters, null, 2)}\`);
console.log(\`   Notes: \${plainLoginExample.notes}\\n\`);

console.log(\`2. \${addHospitalExample.mode}\`);
console.log(\`   \${addHospitalExample.description}\`);
console.log(\`   Parameters: \${JSON.stringify(addHospitalExample.parameters, null, 2)}\`);
console.log(\`   Notes: \${addHospitalExample.notes}\\n\`);

console.log(\`3. \${storedLoginExample.mode}\`);
console.log(\`   \${storedLoginExample.description}\`);
console.log(\`   Parameters: \${JSON.stringify(storedLoginExample.parameters, null, 2)}\`);
console.log(\`   Notes: \${storedLoginExample.notes}\\n\`);

console.log('Security Notes:');
console.log('---------------');
console.log('• Master encryption key is never stored (only SHA-256 fingerprint)');
console.log('• Passwords are encrypted with AES-256-GCM');
console.log('• Each encryption uses unique salt and IV');
console.log('• Key validation ensures same master key for all hospitals');
console.log('• SQLite database stores encrypted credentials locally');

console.log('\\nTo use these examples with Claude Code:');
console.log('1. Ensure nice-paw MCP server is running');
console.log('2. Use the Login tool with appropriate parameters');
console.log('3. Check the response for token and user data');
`;
  writeFileSync(examplePath, exampleContent);
  console.log('   Created examples/enhanced-login-example.js');
}

// Check for plan files
const planReadmePath = join(__dirname, '_plans', 'README.md');
if (!existsSync(planReadmePath)) {
  console.log('\n📋 Creating plan documentation...');
  const planReadme = `# Project Plans Directory

This directory contains implementation plans and design documents for the nice-paw MCP server project.

## Current Plans

### 1. Encryption and Password Storage Implementation
**Status**: ✅ COMPLETED
**Description**: Enhanced login tool with AES-256-GCM encryption, SQLite storage, and master key management.

## Usage
- Store implementation plans and design documents here
- Reference plans from project documentation
- Update status as work progresses
`;
  writeFileSync(planReadmePath, planReadme);
  console.log('   Created _plans/README.md');
}

// Installation instructions
console.log('\n🔧 Installation Steps:');
console.log('-------------------');
console.log('1. Install dependencies:');
console.log('   npm install');
console.log('');
console.log('2. Build the project:');
console.log('   npm run build');
console.log('');
console.log('3. Configure environment:');
console.log('   Edit .env file to set SERVER_URL');
console.log('');
console.log('4. Run tests:');
console.log('   npm test');
console.log('');
console.log('5. Start development server:');
console.log('   npm run dev');
console.log('');
console.log('6. For production:');
console.log('   npm run build');
console.log('   npm start');

// Quick test to check TypeScript compilation
console.log('\n🧪 Running quick checks...');
try {
  // Check TypeScript configuration
  if (existsSync(join(__dirname, 'tsconfig.json'))) {
    console.log('✅ TypeScript configuration found');
  } else {
    console.log('⚠️  tsconfig.json not found');
  }

  // Check source files
  const sourceFiles = ['src/index.ts', 'src/login.ts', 'src/encryption.ts', 'src/storage.ts'];
  let missingFiles = [];
  sourceFiles.forEach(file => {
    if (!existsSync(join(__dirname, file))) {
      missingFiles.push(file);
    }
  });

  if (missingFiles.length === 0) {
    console.log('✅ All source files found');
  } else {
    console.log(`⚠️  Missing source files: ${missingFiles.join(', ')}`);
  }

  console.log('\n🎉 Setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Edit .env file to configure your server URL');
  console.log('2. Run: npm install');
  console.log('3. Run: npm run build');
  console.log('4. Test with: npm test');
  console.log('\nFor help, check:');
  console.log('• README.md - Project overview');
  console.log('• init.md - Detailed setup guide');
  console.log('• examples/ - Usage examples');

} catch (error) {
  console.error('❌ Setup check failed:', error.message);
}

console.log('\n================================');
console.log('nice-paw MCP Server Setup Complete');
console.log('================================');