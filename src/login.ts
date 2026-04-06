import * as z from 'zod/v4';
import 'dotenv/config';

export const loginTool = async (
  options: { email: string; password: string },
  ctx: any // required by MCP
) => {
  const { email, password } = options;
  const url = `${process.env.SERVER_URL}/api/auth/login`;

  try {
    const ret = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    console.log(ret)
    if (!ret.ok) {
      let errorMessage = "Invalid credentials or server error";
      try {
        const errorData = await ret.json();
        if (errorData && (errorData as any).message) {
          errorMessage = (errorData as any).message;
        }
      } catch (e) {
        // Ignore JSON parse errors for error response
      }
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: true,
              message: `Login failed: ${errorMessage}`,
              statusCode: ret.status
            }, null, 2)
          }
        ]
      };
    }

    // Parse response body
    let responseData: any = {};
    try {
      responseData = await ret.json();
    } catch (e) {
      // Ignore if response is not JSON
    }

    // Extract token from response data or Set-Cookie header
    let token = '';
    if (responseData && responseData.token) {
      token = responseData.token;
    } else {
      // Fallback to cookie extraction
      const cookieHeader = ret.headers.get('set-cookie');
      if (cookieHeader) {
        const match = cookieHeader.match(/token=([^;]+)/);
        if (match && match[1]) {
          token = match[1];
        }
      }
    }

    // Extract user data from response
    let userData = null;
    if (responseData && responseData.row) {
      const row = responseData.row;
      userData = {
        id: row.id || null,
        email: row.email || null,
        role: row.role || null,
        name: row.name || null,
        username: row.username || null,
        organizationId: row.organizationId || row.orgId || null,
        organizationName: row.organizationName || row.orgName || null,
        mobile: row.mobile || null,
        professionalAccess: row.professionalAccess || null,
        uuid: row.uuid || null
      };
    }

    // Create structured response according to output schema
    const structuredResponse = {
      token,
      user: userData
    };

    // Return as JSON string for now (can be parsed and stored by other tools)
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(structuredResponse, null, 2)
        }
      ]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: true,
            message: `Login failed: Network error - ${errorMessage}`,
            type: 'network_error'
          }, null, 2)
        }
      ]
    };
  }
};

export const loginToolSchema = z.object({
  email: z.string().email().describe("Email of user"),
  password: z.string().describe("Password of user")
});

export const loginToolOutputSchema = z.object({
  token: z.string().describe("JWT authentication token"),
  user: z.object({
    id: z.number().describe("User ID"),
    email: z.string().describe("User email"),
    role: z.string().describe("User role (admin, staff, etc.)"),
    name: z.string().describe("Full name of user"),
    username: z.string().describe("Username"),
    organizationId: z.number().describe("Organization/hospital ID"),
    organizationName: z.string().describe("Organization/hospital name"),
    mobile: z.string().describe("Mobile number"),
    professionalAccess: z.string().describe("Professional access level"),
    uuid: z.string().describe("User UUID")
  }).describe("User information")
}).describe("Login response with token and user data");