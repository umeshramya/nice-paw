import { McpServer, StdioServerTransport } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { loginTool, loginToolSchema } from "./login.js";
import 'dotenv/config';

export const server = new McpServer({
  name: 'nice-paw',
  version: '2.0.0'
});



server.registerTool(
  "Login",
  {
    title: "Login into Healthcare",
    description:
      "Login into Healthcare organization. Supports plain login, stored hospital login with encrypted credentials, and adding new hospital profiles. Returns JWT token and user data.",
    inputSchema: loginToolSchema
  },
  loginTool
);

const Main = async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
};

Main();