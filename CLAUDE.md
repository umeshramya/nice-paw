# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server for https://www.nicehms.com, built with TypeScript. The project is currently in transition from a simple TypeScript library example to a full MCP server implementation.

## ES Module Configuration

This project uses ES modules (ESM) with Node16 module system.

- `package.json` has `"type": "module"`
- `tsconfig.json` uses `"module": "Node16"` and `"moduleResolution": "node16"`
- Built output in `dist/` uses ES module syntax (import/export)
- Jest tests currently have issues with ES module resolution; tests importing `@modelcontextprotocol/server` may fail

## Development Commands

### Building
- `npm run build` - Compile TypeScript to `dist/` directory
- `npm run dev` - Watch mode for development (recompiles on changes)

### Testing
- `npm test` - Run all Jest tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Publishing
- `npm run build` followed by `npm publish` - Build and publish to npm registry

## Project Structure

- `src/index.ts` - Main entry point for the MCP server
- `src/__tests__/index.test.ts` - Jest tests
- `dist/` - Compiled JavaScript output (gitignored)
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Jest test configuration
- `package.json` - Dependencies and npm scripts

## Architecture

### MCP Server Implementation
The server uses the `@modelcontextprotocol/server` package (version 2.0.0-alpha.2) with stdio transport. It imports `zod` (version 4.3.6) for schema validation, which is commonly used with MCP for defining tool arguments and resource templates. The current implementation is minimal and needs to be expanded with actual tools/resources for nicehms.com integration.

### Current State
- The `src/index.ts` contains a basic MCP server setup but lacks tool/resource definitions
- The test file `src/__tests__/index.test.ts` still expects a `greet` function from the previous library implementation
- Built files in `dist/` correspond to the old greet function implementation

### TypeScript Configuration
- Target: ES2020
- Module: Node16 (ES modules)
- Module resolution: node16
- Isolated modules: true
- Strict mode enabled
- Source maps and declaration maps enabled
- Excludes test files from compilation

## Important Notes

1. **MCP Server Development**: When adding MCP tools or resources, follow the Model Context Protocol specification. The server currently uses `StdioServerTransport` for communication.

2. **Testing Mismatch**: The existing tests reference a `greet` function that no longer exists in the source. New tests should be written for MCP server functionality.

3. **Build Output**: The `dist/` directory contains the compiled output and should not be committed to git (it's in `.gitignore`).

4. **Dependencies**:
   - Core: `@modelcontextprotocol/server` for MCP implementation
   - Development: TypeScript, Jest, ts-jest, and type definitions

5. **Running the Server**: As an MCP server, this package is intended to be used as a CLI tool or integrated with MCP clients. There's no "start" script in package.json; the server connects via stdio transport.

6. **Claude Code Permissions**: The `.claude/settings.local.json` file grants permissions for npm and git operations, including installation, building, testing, and version control commands.

7. **Server Configuration**: The MCP server is currently named "my-server" in `src/index.ts:4`. This should be updated to an appropriate name for the nicehms.com service.

8. **Jest ES Module Issues**: Jest tests currently fail due to ES module resolution problems with `@modelcontextprotocol/server` package. The package is ES module only, and Jest configuration may need additional setup for ES module support.