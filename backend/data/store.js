const { createAuditBlock, computeMerkleRoot } = require('../cryptoUtils');

// Governance Settings
let settings = {
  facilityName: 'Containment Alpha',
  facilityCode: 'BSL-4-ALPHA',
  totalBeds: 74,
  occupiedBeds: 74,
  airLockStatus: 'ACTIVE',
  airLockWing: 'Wing B',
  feverThresholdHigh: 38.5,       // >= 38.5 Critical Fever Spike
  feverThresholdBorderline: 37.5, // 37.5 - 38.4 Caution
  feverFreeHoursRequired: 72,     // ISO-72H-FEVERFREE protocol (3 consecutive days)
  vitalSweepIntervalHours: 4,
  activeDirective: 'CDC-EVD-98.2 / WHO-EPR-2024.1',
  policyHash: '0x89F4...E21',
  currentRole: 'Admin',           // Default simulated persona
  simulationMode: true
};

// Seed audit ledger
let auditBlocks = [];
let genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
let blockCounter = 8941200;

function appendAudit(actor, action, patientId, details) {
  blockCounter++;
  const prevHash = auditBlocks.length > 0 ? auditBlocks[auditBlocks.length - 1].fullBlockHash : genesisHash;
  const block = createAuditBlock(blockCounter, prevHash, actor, action, patientId, details);
  auditBlocks.unshift(block); // Most recent first
  if (auditBlocks.length > 200) auditBlocks.pop();
  return block;
}

// Initial seed audit events
appendAudit('System Daemon', 'CHAIN_GENESIS_INITIALIZED', null, { rule: 'ISO-27799 Sealed Root', state: 'VALIDATED' });
appendAudit('Nurse Sarah Jenkins, RN', 'VITALS_RECORDED', 'QC-029', { temp: 37.1, unit: '°C', route: 'Tympanic', antipyretic: false });
appendAudit('Dr. Aris Thorne, MD', 'DOCTOR_ROUND_COMPLETED', 'QC-008', { diagnosis: 'Surveillance clear', feverFreeWindows: 3, clearance: 'RECOMMENDED' });
appendAudit('Facility Director', 'AIRLOCK_ENGAGED', null, { wing: 'Wing B', pressure: '-15 Pa', reason: 'Active aerosol containment protocol' });
appendAudit('Nurse Sarah Jenkins, RN', 'VITALS_RECORDED', 'QC-014', { temp: 39.1, alert: 'CRITICAL_FEVER_SPIKE', pulse: 112, spO2: 94 });

// Helper to generate seed patients
const firstNames = ['James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Sophia', 'Lucas', 'Ava', 'Mason', 'Isabella', 'Ethan', 'Mia', 'Aiden', 'Harper', 'Jackson', 'Evelyn', 'Logan', 'Abigail', 'David', 'Emily', 'Carter', 'Ella', 'Wyatt', 'Avery', 'Oliver', 'Charlotte', 'Elijah', 'Amelia', 'Benjamin', 'Chloe'];
const lastNames = ['Sterling', 'Vance', 'Mercer', 'Chen', 'Patel', 'Novak', 'Sinclair', 'Hayes', 'Dubois', 'Castillo', 'Kowalski', 'O\'Connor', 'Al-Mansoor', 'Tanaka', 'Mendez', 'Russo', 'Schmidt', 'Larsson', 'Berg', 'Takahashi'];

const cohorts = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'];

function generateInitialPatients() {
  const patients = [];

  for (let i = 1; i <= 74; i++) {
    const bedNumber = i;
    const id = `QC-${String(i).padStart(3, '0')}`;
    let wing = 'Wing A';
    if (i >= 26 && i <= 50) wing = 'Wing B';
    else if (i >= 51 && i <= 65) wing = 'Wing C';
    else if (i >= 66 && i <= 74) wing = 'Wing D';

    const cohortName = `Patient ${cohorts[(i - 1) % cohorts.length]}-${String(i).padStart(2, '0')}`;
    const age = 22 + ((i * 7) % 55);
    const gender = i % 2 === 0 ? 'Female' : 'Male';
    const admittedDaysAgo = 2 + (i % 12);
    const admitDate = new Date(Date.now() - admittedDaysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Determine status & vitals state
    // Key preset patients:
    // QC-008: Discharge Ready (fever free 3 days)
    // QC-014: Critical Fever Spike (39.1°C)
    // QC-029: Just logged (37.1°C)
    // QC-033: Pending vitals (Borderline history)
    let temp = Number((36.8 + ((i * 13) % 15) / 10).toFixed(1));
    let status = 'Under Treatment';
    let tempPending = false;
    let doctorPending = false;
    let feverFreeConsecutiveDays = 1;
    let missingTempWarning = false;

    // 5 Discharge Ready patients
    const isDischargeReady = [8, 21, 45, 62, 70].includes(i);
    // 12 Temperature Pending patients
    const isTempPending = [11, 15, 23, 27, 33, 36, 41, 49, 54, 58, 64, 72].includes(i);
    // 19 Doctor Visit Pending patients
    const isDocPending = [3, 7, 11, 14, 18, 22, 26, 29, 33, 37, 42, 46, 50, 53, 57, 61, 65, 69, 73].includes(i);
    // 5 Missing Temp Warning (pending visit & pending temp)
    const isMissingTempWarning = [11, 33, 53, 61, 73].includes(i);
    // Critical alerts
    const isCritical = [14, 38, 59].includes(i);

    if (isCritical) {
      temp = i === 14 ? 39.1 : (38.7 + (i % 3) * 0.2);
      status = 'Critical / Fever Spike';
      feverFreeConsecutiveDays = 0;
    } else if (isDischargeReady) {
      temp = 36.5 + (i % 5) * 0.1;
      status = 'Discharge Ready';
      feverFreeConsecutiveDays = 3;
    } else if (isTempPending) {
      tempPending = true;
      status = 'Temperature Pending';
    } else if (temp >= 37.8) {
      status = 'Triage Caution';
      feverFreeConsecutiveDays = 0;
    } else {
      status = 'Stable';
      feverFreeConsecutiveDays = 1 + (i % 2);
    }

    if (isDocPending) doctorPending = true;
    if (isMissingTempWarning) missingTempWarning = true;

    // Generate historical vitals readings (last 4 days)
    const vitalsHistory = [];
    const baseHour = Date.now() - 72 * 60 * 60 * 1000;
    for (let h = 0; h <= 72; h += 8) {
      const readTime = new Date(baseHour + h * 60 * 60 * 1000).toISOString();
      let histTemp = temp;
      if (isDischargeReady) {
        histTemp = Number((36.4 + ((h * 7) % 7) * 0.1).toFixed(1));
      } else if (isCritical && h > 48) {
        histTemp = Number((38.6 + (h % 5) * 0.15).toFixed(1));
      } else {
        histTemp = Number((36.8 + ((h + i) % 12) * 0.1).toFixed(1));
      }

      vitalsHistory.push({
        timestamp: readTime,
        temperature: histTemp,
        heartRate: 72 + ((i + h) % 25),
        spO2: isCritical ? 93 + (h % 3) : 97 + (h % 3),
        respirationRate: isCritical ? 24 : 16 + (h % 4),
        bloodPressure: `${118 + (i % 12)}/${76 + (i % 8)}`,
        recordedBy: 'RN Sarah Jenkins',
        antipyreticGiven: false,
        method: 'Tympanic'
      });
    }

    // Latest vital
    const latestVital = vitalsHistory[vitalsHistory.length - 1];

    patients.push({
      id,
      bedNumber,
      bedCode: `ISO-${wing.slice(-1)}-${String(bedNumber).padStart(2, '0')}`,
      wing,
      alias: cohortName,
      name: `${firstNames[(i - 1) % firstNames.length]} ${lastNames[(i - 1) % lastNames.length]}`,
      age,
      gender,
      admittedDate: admitDate,
      isolationDay: admittedDaysAgo,
      attendingPhysician: 'Dr. Aris Thorne, MD',
      primaryNurse: 'RN Sarah Jenkins',
      pressureRoom: wing === 'Wing B' ? '-15 Pa' : '-12 Pa',
      airLockActive: wing === 'Wing B',
      surveillanceTag: `Pathogen Bio-Surveillance #${(i % 5) + 1}`,
      status, // 'Discharge Ready', 'Critical / Fever Spike', 'Temperature Pending', 'Stable', 'Triage Caution', 'Discharged'
      triageScore: isCritical ? 'E1 - Emergent' : isDischargeReady ? 'E5 - Resolved' : 'E3 - Urgent',
      tempPending,
      doctorPending,
      missingTempWarning,
      feverFreeConsecutiveDays,
      antipyreticSuppression: false,
      dischargeChecklist: {
        feverFree72h: isDischargeReady,
        labPcrNegative: isDischargeReady,
        physicianSignoff: isDischargeReady,
        bedDeconScheduled: false
      },
      latestVitals: {
        temperature: tempPending ? null : temp,
        heartRate: latestVital.heartRate,
        spO2: latestVital.spO2,
        respirationRate: latestVital.respirationRate,
        bloodPressure: latestVital.bloodPressure,
        lastLoggedAt: tempPending ? '4h 15m ago' : '18m ago',
        isFeverSpike: temp >= 38.5,
        isCaution: temp >= 37.5 && temp < 38.5
      },
      vitalsHistory,
      doctorNotes: [
        {
          timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
          doctor: 'Dr. Aris Thorne, MD',
          assessment: isDischargeReady 
            ? 'Patient afebrile for >72 consecutive hours. Lungs clear, vital signs stable, PCR surveillance returned negative.'
            : isCritical
            ? 'Acute temperature spike. Ordered blood cultures, infectious disease panel, and increased IV hydration.'
            : 'Patient stable, continuing isolation protocol. Monitor vitals every 4 hours.',
          treatmentPlan: isDischargeReady ? 'Proceed with discharge clearance manifest' : 'Supportive care and isolation monitoring',
          dischargeRecommended: isDischargeReady
        }
      ]
    });
  }

  return patients;
}

let patients = generateInitialPatients();

// Recompute stats
function getStats() {
  const occupied = patients.filter(p => p.status !== 'Discharged').length;
  const vitalsLogged = patients.filter(p => !p.tempPending && p.status !== 'Discharged').length;
  const doctorVisits = patients.filter(p => !p.doctorPending && p.status !== 'Discharged').length;
  const dischargeReady = patients.filter(p => p.status === 'Discharge Ready').length;
  const feverSpikes = patients.filter(p => p.status === 'Critical / Fever Spike' || (p.latestVitals && p.latestVitals.temperature >= 38.5)).length;

  return {
    totalBeds: settings.totalBeds,
    occupiedBeds: occupied,
    occupancyPercent: Math.round((occupied / settings.totalBeds) * 100),
    vitalsLogged,
    vitalsRemaining: occupied - vitalsLogged,
    vitalsPercent: Math.round((vitalsLogged / occupied) * 100),
    doctorVisits,
    doctorVisitsRemaining: occupied - doctorVisits,
    doctorVisitsPercent: Math.round((doctorVisits / occupied) * 100),
    dischargeReady,
    feverSpikes,
    merkleRoot: computeMerkleRoot(auditBlocks),
    lastAuditBlock: auditBlocks[0] ? auditBlocks[0].blockNumber : blockCounter
  };
}

module.exports = {
  settings,
  patients,
  auditBlocks,
  appendAudit,
  getStats
};
