async function testFetch() {
  const email = 'umeshbilagi@gmail.com';
  const password = 'Nice@123';
  const serverUrl = 'http://localhost:3000';
  const url = `${serverUrl}/api/auth/login`;

  console.log('Making fetch request to:', url);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  console.log('Response status:', response.status, response.statusText);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));

  const text = await response.text();
  console.log('Response body:', text);

  try {
    const json = JSON.parse(text);
    console.log('Parsed JSON:', json);
    console.log('Has token property?', 'token' in json);
    if ('token' in json) {
      console.log('Token value:', json.token);
    }
  } catch (e) {
    console.log('Not JSON parseable');
  }
}

testFetch().catch(err => console.error('Error:', err));