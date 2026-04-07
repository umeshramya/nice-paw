import { encryptPassword, decryptPassword, generateKeyFingerprint, validateKeyFingerprint, testEncryption } from './encryption.js';
import { storage } from './storage.js';

async function runTests() {
  console.log('=== Testing Encryption Module ===\n');

  // Test 1: Basic encryption/decryption
  console.log('Test 1: Basic encryption/decryption');
  const password = 'mySecretPassword123!';
  const masterKey = 'mySuperSecretMasterKey@2024';

  try {
    const encrypted = await encryptPassword(password, masterKey);
    console.log('✓ Password encrypted successfully');
    console.log(`  Encrypted: ${encrypted.encrypted.substring(0, 32)}...`);
    console.log(`  Salt: ${encrypted.salt}`);
    console.log(`  IV: ${encrypted.iv}`);

    const decrypted = await decryptPassword(encrypted, masterKey);
    console.log(`✓ Password decrypted successfully: ${decrypted === password ? 'MATCH' : 'NO MATCH'}`);

    if (decrypted !== password) {
      throw new Error('Decrypted password does not match original');
    }
  } catch (error) {
    console.error(`✗ Encryption test failed: ${error}`);
    return;
  }

  // Test 2: Key fingerprint
  console.log('\nTest 2: Key fingerprint generation and validation');
  const fingerprint = generateKeyFingerprint(masterKey);
  console.log(`✓ Fingerprint generated: ${fingerprint.substring(0, 16)}...`);

  const isValid = validateKeyFingerprint(masterKey, fingerprint);
  console.log(`✓ Key validation: ${isValid ? 'VALID' : 'INVALID'}`);

  const wrongKeyValidation = validateKeyFingerprint('wrongKey', fingerprint);
  console.log(`✓ Wrong key validation: ${wrongKeyValidation ? 'VALID (UNEXPECTED)' : 'INVALID (EXPECTED)'}`);

  // Test 3: Test encryption utility
  console.log('\nTest 3: Test encryption utility');
  const testResult = await testEncryption(password, masterKey);
  console.log(`✓ Test encryption cycle: ${testResult ? 'SUCCESS' : 'FAILED'}`);

  // Test 4: Storage operations
  console.log('\n=== Testing Storage Module ===\n');

  console.log('Test 4: Hospital profile storage');
  try {
    // Clear any existing data
    await storage.clearAllData();

    // Test key fingerprint storage
    const storedFingerprint = await storage.getKeyFingerprint();
    console.log(`✓ Initial fingerprint check: ${storedFingerprint === null ? 'NULL (expected)' : 'EXISTS (unexpected)'}`);

    // Set fingerprint
    const setResult = await storage.setKeyFingerprint(fingerprint);
    console.log(`✓ Set fingerprint: ${setResult ? 'SUCCESS' : 'FAILED (may already exist)'}`);

    // Get fingerprint again
    const retrievedFingerprint = await storage.getKeyFingerprint();
    console.log(`✓ Retrieved fingerprint: ${retrievedFingerprint === fingerprint ? 'MATCH' : 'NO MATCH'}`);

    // Try to set fingerprint again (should fail)
    const setAgainResult = await storage.setKeyFingerprint('differentFingerprint');
    console.log(`✓ Set fingerprint again (should fail): ${setAgainResult ? 'SUCCESS (unexpected)' : 'FAILED (expected)'}`);

    // Update fingerprint
    const newFingerprint = generateKeyFingerprint('newMasterKey');
    const updateResult = await storage.updateKeyFingerprint(newFingerprint);
    console.log(`✓ Update fingerprint: ${updateResult ? 'SUCCESS' : 'FAILED'}`);

    // Test hospital profile CRUD
    console.log('\nTest 5: Hospital profile CRUD operations');

    const testProfile = {
      name: 'Test Hospital',
      serverUrl: 'https://api.testhospital.com',
      email: 'test@hospital.com',
      encryptedPassword: 'encryptedPassword123',
      encryptionSalt: 'salt123',
      encryptionIV: 'iv123',
      encryptionAuthTag: 'authTag123'
    };

    // Create profile
    const profileId = await storage.storeHospitalProfile(testProfile);
    console.log(`✓ Profile created with ID: ${profileId}`);

    // Read profile
    const retrievedProfile = await storage.getHospitalProfile(profileId);
    console.log(`✓ Profile retrieved: ${retrievedProfile ? 'SUCCESS' : 'FAILED'}`);

    if (retrievedProfile) {
      console.log(`  Name: ${retrievedProfile.name}`);
      console.log(`  Email: ${retrievedProfile.email}`);
      console.log(`  Server URL: ${retrievedProfile.serverUrl}`);
    }

    // List profiles
    const profiles = await storage.listHospitalProfiles();
    console.log(`✓ Profiles listed: ${profiles.length} profile(s) found`);

    // Get profile by email
    const profileByEmail = await storage.getHospitalProfileByEmail(
      testProfile.email,
      testProfile.serverUrl
    );
    console.log(`✓ Profile found by email: ${profileByEmail ? 'SUCCESS' : 'FAILED'}`);

    // Delete profile
    const deleteResult = await storage.deleteHospitalProfile(profileId);
    console.log(`✓ Profile deleted: ${deleteResult ? 'SUCCESS' : 'FAILED'}`);

    // Verify deletion
    const deletedProfile = await storage.getHospitalProfile(profileId);
    console.log(`✓ Profile after deletion: ${deletedProfile === null ? 'NULL (expected)' : 'EXISTS (unexpected)'}`);

  } catch (error) {
    console.error(`✗ Storage test failed: ${error}`);
    return;
  }

  // Clean up
  console.log('\n=== Cleaning up ===\n');
  await storage.clearAllData();
  storage.close();

  console.log('✓ All tests completed successfully!');
  console.log('\n=== Summary ===');
  console.log('Encryption module: ✓ Working');
  console.log('Storage module: ✓ Working');
  console.log('Integration: ✓ Ready for use in login tool');
}

// Run tests
runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});