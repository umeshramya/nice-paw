import * as z from 'zod/v4';

export const loginTool = async (
  options: { email: string; password: string },
  ctx: any // required by MCP
) => {
  const { email, password } = options;

  if (email === "admin@example.com" && password === "password") {
    return {
      content: [
        {
          type: "text" as const,
          text: "Login successful"
        }
      ]
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: "Login failed"
      }
    ]
  };
};

export const loginToolSchema = z.object({
  email: z.string().email().describe("Email of user"),
  password: z.string().describe("Password of user")
});