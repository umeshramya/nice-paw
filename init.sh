#!/bin/bash

# nice-paw MCP Server Initialization Script
# Run with: ./init.sh or bash init.sh

echo "🔧 nice-paw MCP Server Initialization"
echo "====================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project root?"
    exit 1
fi

# Read project info from package.json
PROJECT_NAME=$(grep '"name"' package.json | head -1 | awk -F: '{print $2}' | sed 's/[", ]//g')
PROJECT_VERSION=$(grep '"version"' package.json | head -1 | awk -F: '{print $2}' | sed 's/[", ]//g')

echo "📦 Project: $PROJECT_NAME v$PROJECT_VERSION"
echo ""

# Check Node.js version
NODE_VERSION=$(node --version)
NODE_MAJOR=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
if [ $NODE_MAJOR -lt 18 ]; then
    echo "❌ Error: Node.js $NODE_VERSION detected."
    echo "   This project requires Node.js 18 or higher."
    echo "   Please upgrade Node.js and try again."
    exit 1
fi
echo "✅ Node.js $NODE_VERSION (requires 18+)"

# Create directories
echo ""
echo "📁 Creating directories..."
mkdir -p dist examples _plans
echo "   Created: dist/, examples/, _plans/"

# Check for .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Creating .env file..."
    cat > .env << 'EOF'
# nice-paw MCP Server Configuration
# =================================

# Healthcare API server URL
# Default: https://www.nicehms.com
SERVER_URL=https://www.nicehms.com

# Database configuration (SQLite)
# SQLite database file will be created automatically
# DATABASE_URL=sqlite:./nice-paw.db

# Logging level (debug, info, warn, error)
LOG_LEVEL=info

# Development mode
# NODE_ENV=development

# Notes:
# 1. The SERVER_URL should point to your healthcare API endpoint
# 2. For production, consider using PostgreSQL instead of SQLite
# 3. Never commit .env file to version control
EOF
    echo "   Created .env file with default configuration"
    echo "   ⚠️  Please edit .env to configure your server URL"
else
    echo ""
    echo "✅ .env file already exists"
fi

# Check for example files
if [ ! -f "examples/enhanced-login-example.js" ]; then
    echo ""
    echo "📝 Creating example files..."
    mkdir -p examples
    cat > examples/enhanced-login-example.js << 'EOF'
// Enhanced Login Example for nice-paw MCP Server
// Run with: node examples/enhanced-login-example.js

console.log('nice-paw MCP Server - Login Examples');
console.log('====================================\n');

console.log('The nice-paw MCP server provides three authentication modes:\n');

console.log('1. Plain Login (backward compatibility)');
console.log('   Parameters: email, password');
console.log('   Example: { email: "admin@hospital.com", password: "secure123" }\n');

console.log('2. Add Hospital with Encrypted Credentials');
console.log('   Parameters: action="add_hospital", email, password, encryptionKey, hospitalName');
console.log('   Example: { action: "add_hospital", email: "admin@hospital.com",');
console.log('             password: "secure123", encryptionKey: "masterKey123!",');
console.log('             hospitalName: "General Hospital" }\n');

console.log('3. Login with Stored Hospital Profile');
console.log('   Parameters: hospitalId, encryptionKey');
console.log('   Example: { hospitalId: "1", encryptionKey: "masterKey123!" }\n');

console.log('To use with Claude Code:');
console.log('1. Ensure the MCP server is configured in your settings');
console.log('2. Use the "Login" tool with appropriate parameters');
console.log('3. The response will include JWT token and user data\n');

console.log('Security Features:');
console.log('• AES-256-GCM encryption with PBKDF2 key derivation');
console.log('• Master key fingerprint validation');
console.log('• Local SQLite storage of encrypted credentials');
console.log('• Never stores the master encryption key');
EOF
    echo "   Created examples/enhanced-login-example.js"
fi

# Check for plan documentation
if [ ! -f "_plans/README.md" ]; then
    echo ""
    echo "📋 Creating plan documentation..."
    mkdir -p _plans
    cat > _plans/README.md << 'EOF'
# Project Plans Directory

This directory contains implementation plans for the nice-paw MCP server.

## Current Plans

### Encryption and Password Storage
**Status**: ✅ COMPLETED
**Description**: Enhanced login with AES-256-GCM encryption and SQLite storage.

## Usage
- Store implementation plans here
- Reference from project documentation
- Update status as work progresses
EOF
    echo "   Created _plans/README.md"
fi

echo ""
echo "🔧 Installation Instructions:"
echo "---------------------------"
echo "1. Install dependencies:"
echo "   npm install"
echo ""
echo "2. Build the project:"
echo "   npm run build"
echo ""
echo "3. Configure environment:"
echo "   Edit .env file (set SERVER_URL)"
echo ""
echo "4. Run tests:"
echo "   npm test"
echo ""
echo "5. Start development:"
echo "   npm run dev"
echo ""
echo "📚 Documentation:"
echo "• README.md - Project overview"
echo "• init.md - Detailed setup guide"
echo "• examples/ - Usage examples"
echo ""
echo "🎉 Initialization complete!"
echo ""
echo "Next: Run 'npm install' to install dependencies"