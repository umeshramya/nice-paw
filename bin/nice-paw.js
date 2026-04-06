#!/usr/bin/env node

// Entry point for nice-paw MCP server
// This file is an ES module that imports the server which auto-starts

import '../dist/index.js';

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});