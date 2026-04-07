import { loginTool } from './dist/login.js';

async function test() {
  console.log('Testing loginTool...');

  const result = await loginTool({
    email: 'umeshbilagi@gmail.com',
    password: 'Nice@123',
    serverUrl: 'http://localhost:3000'
  }, {});

  console.log('Result:', result);
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});