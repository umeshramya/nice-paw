import { McpServer, StdioServerTransport } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { loginTool, loginToolSchema } from "./login.js";

export const server = new McpServer({
  name: 'nice-paw',
  version: '1.0.0'
});



server.registerTool(
  "Login",
  {
    title: "Login into Healthcare",
    description:
      "Login into Healthcare organization using email and password. Returns JWT token.",
    inputSchema: loginToolSchema
  },
  loginTool
);

const Main = async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
};

Main();