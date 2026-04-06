import { loginTool } from './dist/login.js';

async function test() {
  const result = await loginTool(
    { email: 'umeshbilagi@gmail.com', password: 'Nice@123' },
    {} as any
  );
  console.log('Full result:', JSON.stringify(result, null, 2));

  // The tool returns content with JSON string in text field
  if (result.content && result.content[0] && result.content[0].text) {
    try {
      const parsed = JSON.parse(result.content[0].text);
      console.log('\nParsed response:');
      console.log(JSON.stringify(parsed, null, 2));

      if (!parsed.error && parsed.token && parsed.user) {
        console.log('\nKey fields:');
        console.log('Token:', parsed.token.substring(0, 50) + '...');
        console.log('User ID:', parsed.user.id);
        console.log('Email:', parsed.user.email);
        console.log('Organization ID:', parsed.user.organizationId);
        console.log('Organization Name:', parsed.user.organizationName);
        console.log('UUID:', parsed.user.uuid);
      }
    } catch (e) {
      console.log('Could not parse as JSON, showing raw text:');
      console.log(result.content[0].text);
    }
  }
}

test().catch(console.error);