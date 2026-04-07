import * as z from 'zod/v4';
import 'dotenv/config';
import { encryptPassword, decryptPassword, generateKeyFingerprint, validateKeyFingerprint } from './encryption.js';
import { storage } from './storage.js';

/**
 * Authenticate with the healthcare API
 */
async function authenticateWithAPI(email: string, password: string, serverUrl?: string): Promise<{ token: string; user: any }> {
  const baseUrl = serverUrl || process.env.SERVER_URL;
  if (!baseUrl) {
    throw new Error('SERVER_URL environment variable is not set and no serverUrl provided');
  }
  const url = `${baseUrl.replace(/\/$/, '')}/api/auth/login`;
  console.log('DEBUG: fetch URL:', url);

  const ret = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

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
    throw new Error(`Login failed: ${errorMessage} (Status: ${ret.status})`);
  }

  // Parse response body
  let responseData: any = {};
  try {
    responseData = await ret.json();
    console.log('DEBUG: responseData', JSON.stringify(responseData));
  } catch (e) {
    // Ignore if response is not JSON
    console.log('DEBUG: JSON parse error', e);
  }

  // Extract token from response data or Set-Cookie header
  let token = '';
  if (responseData && responseData.token) {
    token = responseData.token;
  } else {
    // Fallback to cookie extraction
    const cookieHeader = ret.headers.get('set-cookie');
    console.log('DEBUG: cookieHeader', cookieHeader);
    if (cookieHeader) {
      const match = cookieHeader.match(/token=([^;]+)/);
      console.log('DEBUG: cookie match', match);
      if (match && match[1]) {
        token = match[1];
      }
    }
  }

  if (!token) {
    console.log('DEBUG: No token found. responseData:', responseData);
    throw new Error('No authentication token found in response');
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

  return { token, user: userData };
}

/**
 * Enhanced login tool with encryption and hospital profile support
 */
export const loginTool = async (
  options: {
    email?: string;
    password?: string;
    encryptionKey?: string;
    hospitalId?: string;
    action?: string;
    hospitalName?: string;
    serverUrl?: string;
  },
  ctx: any // required by MCP
) => {
  try {
    const {
      email,
      password,
      encryptionKey,
      hospitalId,
      action = 'login',
      hospitalName,
      serverUrl = process.env.SERVER_URL
    } = options;

    // Validate required parameters based on action
    if (action === 'add_hospital') {
      if (!email || !password || !encryptionKey) {
        throw new Error('For adding a hospital, email, password, and encryptionKey are required');
      }
      if (!hospitalName) {
        throw new Error('Hospital name is required when adding a hospital');
      }
    } else if (hospitalId) {
      // Login with stored hospital profile
      if (!encryptionKey) {
        throw new Error('Encryption key is required when using stored hospital profile');
      }
    } else {
      // Plain login (backward compatibility)
      if (!email || !password) {
        throw new Error('Email and password are required for plain login');
      }
    }

    let token = '';
    let user = null;
    let hospitalProfile = null;
    let keyValidated = false;

    if (action === 'add_hospital') {
      // Add new hospital profile with encrypted password
      if (!email || !password || !encryptionKey || !hospitalName) {
        throw new Error('Missing required parameters for adding hospital');
      }

      // Validate encryption key against stored fingerprint (if any)
      const storedFingerprint = await storage.getKeyFingerprint();
      if (storedFingerprint) {
        keyValidated = validateKeyFingerprint(encryptionKey, storedFingerprint);
        if (!keyValidated) {
          throw new Error('Encryption key does not match previously used key');
        }
      } else {
        // First hospital being added, store the key fingerprint
        const fingerprint = generateKeyFingerprint(encryptionKey);
        await storage.setKeyFingerprint(fingerprint);
        keyValidated = true;
      }

      // Encrypt the password
      const encryptedData = await encryptPassword(password, encryptionKey);

      // Authenticate with the API to verify credentials
      const authResult = await authenticateWithAPI(email, password, serverUrl);

      // Store the hospital profile
      const profileId = await storage.storeHospitalProfile({
        name: hospitalName,
        serverUrl: serverUrl || process.env.SERVER_URL || '',
        email,
        encryptedPassword: encryptedData.encrypted,
        encryptionSalt: encryptedData.salt,
        encryptionIV: encryptedData.iv,
        encryptionAuthTag: encryptedData.authTag
      });

      // Get the stored profile
      const storedProfile = await storage.getHospitalProfile(profileId);
      if (storedProfile) {
        hospitalProfile = {
          id: storedProfile.id,
          name: storedProfile.name,
          serverUrl: storedProfile.serverUrl,
          email: storedProfile.email
        };
      }

      token = authResult.token;
      user = authResult.user;

    } else if (hospitalId) {
      // Login with stored hospital profile
      if (!encryptionKey) {
        throw new Error('Encryption key is required for stored hospital login');
      }

      // Get the hospital profile
      const profile = await storage.getHospitalProfile(parseInt(hospitalId));
      if (!profile) {
        throw new Error(`Hospital profile with ID ${hospitalId} not found`);
      }

      // Decrypt the password
      const decryptedPassword = await decryptPassword({
        encrypted: profile.encryptedPassword,
        salt: profile.encryptionSalt,
        iv: profile.encryptionIV,
        authTag: profile.encryptionAuthTag
      }, encryptionKey);

      // Authenticate with the API
      const authResult = await authenticateWithAPI(profile.email, decryptedPassword, profile.serverUrl);

      token = authResult.token;
      user = authResult.user;
      hospitalProfile = {
        id: profile.id,
        name: profile.name,
        serverUrl: profile.serverUrl,
        email: profile.email
      };

    } else {
      // Plain login (backward compatibility)
      if (!email || !password) {
        throw new Error('Email and password are required for plain login');
      }

      const authResult = await authenticateWithAPI(email, password, serverUrl);
      token = authResult.token;
      user = authResult.user;
    }

    // Create structured response
    const structuredResponse: any = {
      token,
      user
    };

    // Add optional fields if present
    if (hospitalProfile) {
      structuredResponse.hospitalProfile = hospitalProfile;
    }
    if (keyValidated) {
      structuredResponse.keyValidated = keyValidated;
    }

    // Return as JSON string
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
            message: `Login failed: ${errorMessage}`,
            type: 'login_error'
          }, null, 2)
        }
      ]
    };
  }
};

export const loginToolSchema = z.object({
  email: z.string().email().optional().describe("Email of user (required for plain login or adding hospital)"),
  password: z.string().optional().describe("Password of user (required for plain login or adding hospital)"),
  encryptionKey: z.string().optional().describe("Master encryption key for hospital management"),
  hospitalId: z.string().optional().describe("ID of stored hospital profile for login"),
  action: z.enum(['login', 'add_hospital']).default('login').describe("Action to perform: 'login' (default) or 'add_hospital'"),
  hospitalName: z.string().optional().describe("Name of hospital (required when adding hospital)"),
  serverUrl: z.string().optional().describe("Server URL (defaults to SERVER_URL environment variable)")
}).describe("Login into Healthcare organization. Supports plain login, stored hospital login, and adding new hospital profiles with encrypted password storage.");

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
  }).describe("User information"),
  hospitalProfile: z.object({
    id: z.number().describe("Hospital profile ID"),
    name: z.string().describe("Hospital name"),
    serverUrl: z.string().describe("Server URL"),
    email: z.string().describe("Email used for this hospital")
  }).optional().describe("Hospital profile information (when adding or using stored hospital)"),
  keyValidated: z.boolean().optional().describe("Whether encryption key was validated successfully")
}).describe("Login response with token, user data, and optional hospital profile information");