import { loginTool } from '../login.js';
import { server } from '../index.js';

describe('loginTool', () => {
  it('should return success content for valid credentials', async () => {
    const result = await loginTool(
      { email: 'admin@example.com', password: 'password' },
      {} // mock context
    );
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Login successful'
        }
      ]
    });
  });

  it('should return failure content for invalid email', async () => {
    const result = await loginTool(
      { email: 'wrong@example.com', password: 'password' },
      {}
    );
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Login failed'
        }
      ]
    });
  });

  it('should return failure content for invalid password', async () => {
    const result = await loginTool(
      { email: 'admin@example.com', password: 'wrong' },
      {}
    );
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Login failed'
        }
      ]
    });
  });

  it('should return failure content for both invalid', async () => {
    const result = await loginTool(
      { email: 'user@example.com', password: 'wrong' },
      {}
    );
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Login failed'
        }
      ]
    });
  });
});

describe('server tool registration', () => {
  // Note: The MCP server does not expose a public API to query registered tools,
  // but we can verify the server instance exists and is configured.
  it('server should be defined', () => {
    expect(server).toBeDefined();
  });

  // Additional integration tests could be added using the MCP SDK test utilities
  // but they are beyond the scope of this unit test.
});