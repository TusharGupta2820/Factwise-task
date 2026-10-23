// Automated Role-Based Access Control & Clinical Feature Verification Script
// Tests all 3 roles: Nurse, Doctor, Administrator

const BASE_URL = 'http://localhost:5000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // text
  }
  return { status: res.status, ok: res.ok, data };
}

let testPassed = 0;
let testFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testFailed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 STARTING COMPREHENSIVE 3-ROLE RBAC & FEATURE SUITE');
  console.log('====================================================\n');

  // --- SECTION 1: AUTHENTICATION & CREDENTIAL VERIFICATION ---
  console.log('📋 [SECTION 1] AUTHENTICATION & CREDENTIAL VERIFICATION');
  
  // 1.1 Nurse Login
  const nurseLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'nurse@quarantinecare.org', password: 'nurse123' })
  });
  assert(nurseLogin.status === 200 && nurseLogin.data.data?.role === 'Nurse', 'Nurse authentication succeeds and returns Nurse profile');

  // 1.2 Doctor Login
  const docLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'doctor@quarantinecare.org', password: 'doctor123' })
  });
  assert(docLogin.status === 200 && docLogin.data.data?.role === 'Doctor', 'Doctor authentication succeeds and returns Doctor profile');

  // 1.3 Admin Login
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@quarantinecare.org', password: 'admin123' })
  });
  assert(adminLogin.status === 200 && adminLogin.data.data?.role === 'Admin', 'Admin authentication succeeds and returns Admin profile');

  // 1.4 Invalid Credentials
  const badLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'nurse@quarantinecare.org', password: 'wrongpassword' })
  });
  assert(badLogin.status === 401, 'Invalid credentials properly rejected with 401 Unauthorized');


  // --- SECTION 2: NURSE ROLE FEATURES & BOUNDARIES ---
  console.log('\n📋 [SECTION 2] NURSE ROLE (Sarah Jenkins, RN) FEATURES & RESTRICTIONS');

  // 2.1 Nurse reads patient registry (Ward B)
  const nursePatients = await request('/api/patients?wing=wingb', {
    headers: { 'x-user-role': 'Nurse' }
  });
  assert(nursePatients.status === 200 && nursePatients.data.data.length > 0, `Nurse successfully reads Ward B patients (Count: ${nursePatients.data?.data?.length})`);

  // Pick a patient for vitals test
  const testPatientId = nursePatients.data.data[0].id;

  // 2.2 Nurse records bedside vitals (Normal temperature)
  const nurseRecordNormal = await request('/api/vitals', {
    method: 'POST',
    headers: { 'x-user-role': 'Nurse' },
    body: JSON.stringify({
      patientId: testPatientId,
      temperature: 36.8,
      heartRate: 74,
      spO2: 98,
      respirationRate: 16,
      bloodPressure: '118/76',
      method: 'Tympanic',
      antipyreticGiven: false,
      recordedBy: 'Nurse Sarah Jenkins, RN'
    })
  });
  assert(nurseRecordNormal.status === 200 && nurseRecordNormal.data.success, `Nurse successfully logs bedside vitals for ${testPatientId}`);

  // 2.3 Nurse records fever spike (≥ 38.5°C) -> should trigger alert flag
  const nurseRecordSpike = await request('/api/vitals', {
    method: 'POST',
    headers: { 'x-user-role': 'Nurse' },
    body: JSON.stringify({
      patientId: testPatientId,
      temperature: 39.1,
      heartRate: 104,
      spO2: 95,
      respirationRate: 22,
      bloodPressure: '135/88',
      method: 'Tympanic',
      antipyreticGiven: false,
      symptoms: ['Chills', 'Diaphoresis'],
      recordedBy: 'Nurse Sarah Jenkins, RN'
    })
  });
  const latestVitals = nurseRecordSpike.data?.data?.latestVitals;
  assert(nurseRecordSpike.status === 200 && latestVitals?.isFeverSpike === true, 'Fever spike ≥ 38.5°C correctly triggers isFeverSpike: true');

  // 2.4 Nurse CANNOT conduct doctor rounds (Security check)
  const nurseRoundAttempt = await request('/api/rounds', {
    method: 'POST',
    headers: { 'x-user-role': 'Nurse' },
    body: JSON.stringify({
      patientId: testPatientId,
      assessment: 'Nurse attempting doctor evaluation',
      treatmentPlan: 'Restricted',
      triageStatus: 'Stable'
    })
  });
  assert(nurseRoundAttempt.status === 403, 'Nurse is strictly FORBIDDEN from logging doctor clinical rounds (403)');

  // 2.5 Nurse CANNOT recommend discharge (Security check)
  const nurseDischargeRec = await request('/api/discharge/recommend', {
    method: 'POST',
    headers: { 'x-user-role': 'Nurse' },
    body: JSON.stringify({
      patientId: testPatientId,
      recommendationNotes: 'Nurse discharge recommendation attempt'
    })
  });
  assert(nurseDischargeRec.status === 403, 'Nurse is strictly FORBIDDEN from recommending discharge (403)');

  // 2.6 Nurse CANNOT release bed / authorize turnover (Security check)
  const nurseBedRelease = await request('/api/discharge/release', {
    method: 'POST',
    headers: { 'x-user-role': 'Nurse' },
    body: JSON.stringify({ patientId: testPatientId })
  });
  assert(nurseBedRelease.status === 403, 'Nurse is strictly FORBIDDEN from releasing beds / terminal turnover (403)');

  // 2.7 Nurse CANNOT modify governance settings (Security check)
  const nurseSettingsUpdate = await request('/api/settings', {
    method: 'PUT',
    headers: { 'x-user-role': 'Nurse' },
    body: JSON.stringify({ totalBeds: 50 })
  });
  assert(nurseSettingsUpdate.status === 403, 'Nurse is strictly FORBIDDEN from altering facility governance parameters (403)');


  // --- SECTION 3: DOCTOR ROLE FEATURES & BOUNDARIES ---
  console.log('\n📋 [SECTION 3] DOCTOR ROLE (Dr. Aris Thorne, MD) FEATURES & RESTRICTIONS');

  // 3.1 Doctor reads rounds queue
  const docQueue = await request('/api/rounds/queue', {
    headers: { 'x-user-role': 'Doctor' }
  });
  assert(docQueue.status === 200 && Array.isArray(docQueue.data.data), `Doctor successfully retrieves rounds queue (Queue size: ${docQueue.data?.data?.length})`);

  // 3.2 Doctor logs clinical evaluation & treatment plan
  const docRoundSuccess = await request('/api/rounds', {
    method: 'POST',
    headers: { 'x-user-role': 'Doctor' },
    body: JSON.stringify({
      patientId: testPatientId,
      assessment: 'Patient under acute observation following febrile excursion. Bilateral crackles auscultated.',
      treatmentPlan: 'Initiate targeted antimicrobial therapy, continue 4H vital telemetry sweep.',
      triageStatus: 'Critical / Fever Spike',
      recordedBy: 'Dr. Aris Thorne, MD'
    })
  });
  assert(docRoundSuccess.status === 200 && docRoundSuccess.data.success, `Doctor successfully submits clinical round for ${testPatientId}`);

  // Find a patient who has completed ISO-72H streak (discharge ready candidate)
  const allPatients = await request('/api/patients', { headers: { 'x-user-role': 'Doctor' } });
  const dischargeCandidate = allPatients.data.data.find(p => p.feverFreeConsecutiveDays >= 3) || allPatients.data.data[1];

  // 3.3 Doctor recommends discharge with medical justification
  const docRecommend = await request('/api/discharge/recommend', {
    method: 'POST',
    headers: { 'x-user-role': 'Doctor' },
    body: JSON.stringify({
      patientId: dischargeCandidate.id,
      recommendationNotes: 'Patient has completed mandatory 72H afebrile protocol without antipyretics. Serial PCR non-detectable. Clinically fit for discharge.',
      recommendedBy: 'Dr. Aris Thorne, MD'
    })
  });
  assert(docRecommend.status === 200 && docRecommend.data.success, `Doctor successfully issues discharge recommendation for candidate ${dischargeCandidate.id}`);

  // 3.4 Doctor CANNOT release bed (Security check - Bed release is Directorate Administrator exclusive)
  const docReleaseAttempt = await request('/api/discharge/release', {
    method: 'POST',
    headers: { 'x-user-role': 'Doctor' },
    body: JSON.stringify({ patientId: dischargeCandidate.id })
  });
  assert(docReleaseAttempt.status === 403, 'Doctor is strictly FORBIDDEN from releasing beds / bed turnover authorization (403)');

  // 3.5 Doctor CANNOT reallocate capacity or register patients (Security check)
  const docPatientRegister = await request('/api/patients', {
    method: 'POST',
    headers: { 'x-user-role': 'Doctor' },
    body: JSON.stringify({ name: 'Unauthorized Inpatient', age: 30 })
  });
  assert(docPatientRegister.status === 403, 'Doctor is strictly FORBIDDEN from registering new admissions / allocating beds (403)');

  // 3.6 Doctor CANNOT modify user roles (Security check)
  const docUserRoleChange = await request('/api/users/usr_nurse_01/role', {
    method: 'PUT',
    headers: { 'x-user-role': 'Doctor' },
    body: JSON.stringify({ role: 'Admin' })
  });
  assert(docUserRoleChange.status === 403, 'Doctor is strictly FORBIDDEN from modifying staff roles (403)');


  // --- SECTION 4: ADMINISTRATOR ROLE FEATURES & GOVERNANCE ---
  console.log('\n📋 [SECTION 4] ADMINISTRATOR (Medical Directorate) FEATURES & GOVERNANCE');

  // 4.1 Admin checks system overview statistics
  const adminStats = await request('/api/stats', {
    headers: { 'x-user-role': 'Admin' }
  });
  assert(adminStats.status === 200 && adminStats.data.data.totalBeds === 74, `Admin retrieves system statistics (Total beds: ${adminStats.data.data.totalBeds}, Occupied: ${adminStats.data.data.occupiedBeds})`);

  // 4.2 Admin views user directory
  const adminUsers = await request('/api/users', {
    headers: { 'x-user-role': 'Admin' }
  });
  assert(adminUsers.status === 200 && adminUsers.data.data.length >= 3, `Admin accesses staff directory (Staff members: ${adminUsers.data.data.length})`);

  // 4.3 Admin updates staff user role
  const adminRoleUpdate = await request('/api/users/usr_nurse_01/role', {
    method: 'PUT',
    headers: { 'x-user-role': 'Admin' },
    body: JSON.stringify({ role: 'Nurse' })
  });
  assert(adminRoleUpdate.status === 200 && adminRoleUpdate.data.success, 'Admin successfully reassigns staff role in cryptographic directory');

  // 4.4 Admin verifies and modifies facility governance parameters
  const adminSettingsUpdate = await request('/api/settings', {
    method: 'PUT',
    headers: { 'x-user-role': 'Admin' },
    body: JSON.stringify({
      facilityName: 'Containment Alpha',
      facilityCode: 'BSL-4-ALPHA',
      totalBeds: 74,
      airLockStatus: 'ACTIVE',
      airLockWing: 'Wing B',
      feverThresholdHigh: 38.5,
      feverThresholdBorderline: 37.5,
      feverFreeHoursRequired: 72,
      vitalSweepIntervalHours: 4,
      activeDirective: 'CDC-EVD-98.2 / WHO-EPR-2024.1'
    })
  });
  assert(adminSettingsUpdate.status === 200 && adminSettingsUpdate.data.success, 'Admin successfully seals facility operating parameters and clinical thresholds');

  // 4.5 Admin performs authorized Bed Turnover & Release
  // Ensure discharge ready patient has required flags
  dischargeCandidate.dischargeChecklist = {
    biometricsVerified: true,
    labPcrNegative: true,
    attendingPhysicianApproval: true,
    decontaminationReady: true
  };
  dischargeCandidate.dischargeRecommended = true;

  const adminBedRelease = await request('/api/discharge/release', {
    method: 'POST',
    headers: { 'x-user-role': 'Admin' },
    body: JSON.stringify({
      patientId: dischargeCandidate.id,
      terminalDeconConfirmed: true
    })
  });
  assert(adminBedRelease.status === 200 && adminBedRelease.data.success, `Admin successfully executes bed turnover release for ${dischargeCandidate.id}`);

  // 4.6 Admin audits cryptographic Merkle Ledger
  const auditRes = await request('/api/audit', {
    headers: { 'x-user-role': 'Admin' }
  });
  assert(auditRes.status === 200 && auditRes.data.data.length > 0, `Admin inspects cryptographic ledger (Blocks: ${auditRes.data.data.length}, Root Hash: ${auditRes.data.merkleRoot})`);

  // 4.7 Admin verifies cryptographic integrity (Zero-drift confirmation)
  const auditVerify = await request('/api/audit/verify', {
    method: 'POST',
    headers: { 'x-user-role': 'Admin' }
  });
  assert(auditVerify.status === 200 && auditVerify.data.chainValid === true, 'Cryptographic Merkle tree integrity verified: Hash chain unbroken & Zero drift');

  console.log('\n====================================================');
  console.log(`📊 FINAL TEST SUMMARY: ${testPassed} PASSED, ${testFailed} FAILED`);
  console.log('====================================================');

  if (testFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
