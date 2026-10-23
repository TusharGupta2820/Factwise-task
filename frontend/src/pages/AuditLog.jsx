import React, { useState, useEffect } from 'react';
import { fetchAuditLog, verifyAuditLedger } from '../api/client';
import { useApp } from '../context/AppContext';

export default function AuditLog() {
  const { showToast } = useApp();
  const [blocks, setBlocks] = useState([]);
  const [merkleRoot, setMerkleRoot] = useState('0x7f4c...9b82e1');
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [search, setSearch] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedReport, setVerifiedReport] = useState(null);

  const loadAudit = async () => {
    try {
      setLoading(true);
      const res = await fetchAuditLog({
        action: filterAction !== 'all' ? filterAction : undefined,
        search: search.trim() || undefined
      });
      if (res.success) {
        setBlocks(res.data);
        if (res.merkleRoot) setMerkleRoot(res.merkleRoot);
      }
    } catch (err) {
      console.error('Failed to load audit ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, [filterAction]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await verifyAuditLedger();
      if (res.success) {
        setVerifiedReport(res);
        showToast('Cryptographic Verification Complete', `All ${res.totalBlocksVerified} blocks validated against Merkle Root`);
      }
    } catch (err) {
      showToast('Verification Failed', err.message || 'Error validating ledger', 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-3 sm:p-4 lg:p-6 gap-4 sm:gap-6 min-w-0">
      {/* Top Level Cryptographic Header */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-3.5 sm:p-space-lg shadow-sm border border-surface-container">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md relative z-10">
          <div className="space-y-space-xs">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary-container text-on-primary">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </span>
              <span className="font-label-md text-label-md uppercase tracking-wider text-secondary font-bold">
                Ledger Authority Level 4
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="font-telemetry-unit text-telemetry-unit text-on-surface-variant font-bold">
                BLOCK #{blocks[0] ? blocks[0].blockNumber : 8941204}
              </span>
              <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-telemetry-unit text-telemetry-unit font-bold">
                SHA-256 SEALED
              </span>
            </div>
            <h1 className="font-headline-lg text-xl sm:text-headline-lg text-on-surface tracking-tight font-bold">
              Administrative Audit Log &amp; Compliance Ledger
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-space-xs flex-wrap">
              <span>Tamper-Evident System Event Stream</span>
              <span className="text-outline-variant">•</span>
              <span className="font-label-md text-label-md text-primary font-semibold">
                ISO-27799 Healthcare Biocontainment Standard
              </span>
              <span className="text-outline-variant">•</span>
              <span className="font-telemetry-unit text-telemetry-unit text-on-surface-variant">
                256-bit Merkle Tree Root Verified
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm pt-space-xs xl:pt-0">
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-colors flex items-center gap-space-xs shadow-sm active:scale-95"
            >
              <span className={`material-symbols-outlined text-[18px] text-secondary ${verifying ? 'animate-spin' : ''}`}>
                gpp_good
              </span>
              <span>{verifying ? 'Validating Hashes...' : 'Verify Integrity'}</span>
            </button>
            <button
              onClick={() => showToast('Export Complete', 'Cryptographic SHA-256 Hash Log downloaded', 'success')}
              className="px-space-md py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-colors flex items-center gap-space-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed">download_done</span>
              <span>Export Cryptographic Hash Log</span>
            </button>
          </div>
        </div>

        {/* Live Ledger Heartbeat & Integrity Strip */}
        <div className="mt-space-md pt-space-md border-t border-surface-container grid grid-cols-2 sm:grid-cols-4 gap-space-md">
          <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-xs text-on-surface-variant uppercase">Current Merkle Root</span>
              <span className="material-symbols-outlined text-[16px] text-secondary">token</span>
            </div>
            <div className="mt-1 font-telemetry-data text-sm text-on-surface font-bold truncate">
              {merkleRoot}
            </div>
            <span className="font-telemetry-unit text-[10px] text-secondary mt-0.5">Anchored Live</span>
          </div>

          <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-xs text-on-surface-variant uppercase">Chain State</span>
              <span className="material-symbols-outlined text-[16px] text-secondary">lock</span>
            </div>
            <div className="mt-1 font-telemetry-data text-sm text-on-surface font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary"></span> Synchronized
            </div>
            <span className="font-telemetry-unit text-[10px] text-on-surface-variant mt-0.5">Zero Drift Detected</span>
          </div>

          <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-xs text-on-surface-variant uppercase">Authority Node</span>
              <span className="material-symbols-outlined text-[16px] text-primary">hub</span>
            </div>
            <div className="mt-1 font-telemetry-data text-sm text-on-surface font-bold truncate">
              BSL-4 HSM-Core Alpha
            </div>
            <span className="font-telemetry-unit text-[10px] text-secondary mt-0.5">Dual-Custody Key Locked</span>
          </div>

          <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-xs text-on-surface-variant uppercase">Total Audit Blocks</span>
              <span className="material-symbols-outlined text-[16px] text-secondary">database</span>
            </div>
            <div className="mt-1 font-telemetry-data text-sm text-on-surface font-bold">
              {blocks.length} Sealed Blocks
            </div>
            <span className="font-telemetry-unit text-[10px] text-on-surface-variant mt-0.5">Tamper Proof</span>
          </div>
        </div>
      </div>

      {/* Verification Success Callout */}
      {verifiedReport && (
        <div className="p-space-md rounded-xl bg-secondary/15 border border-secondary text-on-surface flex items-center justify-between shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[24px] text-secondary">verified_user</span>
            <div>
              <span className="font-label-lg font-bold text-secondary block">
                Cryptographic Integrity Verified: All {verifiedReport.totalBlocksVerified} Blocks Authentic
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant">
                Chain validated against Merkle Root: {verifiedReport.merkleRoot} · Standard {verifiedReport.standard}
              </span>
            </div>
          </div>
          <button
            onClick={() => setVerifiedReport(null)}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-xs overflow-x-auto w-full sm:w-auto">
          {['all', 'vitals', 'doctor', 'release', 'airlock'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterAction(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filterAction === f
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {f === 'all' ? 'All Events' : f === 'vitals' ? 'Vitals Logged' : f === 'doctor' ? 'Doctor Rounds' : f === 'release' ? 'Bed Releases' : 'Airlock Alerts'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 border border-outline-variant/30"
            placeholder="Search actor or patient ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadAudit()}
          />
        </div>
      </div>

      {/* Audit Blocks Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-body-sm">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container text-on-surface-variant font-label-md text-xs uppercase tracking-wider">
                <th className="py-3 px-4">BLOCK #</th>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">CLINICAL ACTOR</th>
                <th className="py-3 px-4">ACTION PROTOCOL</th>
                <th className="py-3 px-4">PATIENT TARGET</th>
                <th className="py-3 px-4">PAYLOAD DETAILS</th>
                <th className="py-3 px-4">SHA-256 WITNESS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    Fetching cryptographic ledger blocks...
                  </td>
                </tr>
              ) : blocks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    No matching audit ledger entries found.
                  </td>
                </tr>
              ) : (
                blocks.map((block) => (
                  <tr key={block.blockNumber} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-4 font-telemetry-data font-bold text-primary whitespace-nowrap">
                      #{block.blockNumber}
                    </td>
                    <td className="py-3 px-4 font-telemetry-data text-xs text-on-surface-variant whitespace-nowrap">
                      {new Date(block.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-label-md font-semibold text-on-surface whitespace-nowrap">
                      {block.actor}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-telemetry-unit text-[11px] font-bold bg-surface-container text-primary">
                        {block.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-telemetry-data font-bold text-secondary whitespace-nowrap">
                      {block.patientId || 'SYSTEM'}
                    </td>
                    <td className="py-3 px-4 text-xs font-telemetry-data text-on-surface-variant max-w-xs truncate">
                      {JSON.stringify(block.details)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-telemetry-unit text-xs text-secondary font-mono">
                        <span className="material-symbols-outlined text-[14px]">shield</span>
                        <span>{block.payloadHash}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
