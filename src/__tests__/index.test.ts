import { loginTool } from '../login.js';


describe('loginTool', () => {
  test("Login with email", async () => {
    const result = await loginTool({
        "email" : "umeshbilagi@gmail.com",
        "password" : "Nice@123",
        "serverUrl" : "http://localhost:3000"
    }, {})

    console.log(result)

    expect(1).toEqual(1);
  });
});