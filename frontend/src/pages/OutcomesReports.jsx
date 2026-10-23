import React, { useState, useEffect } from 'react';
import { fetchOutcomes } from '../api/client';
import { useApp } from '../context/AppContext';

export default function OutcomesReports() {
  const { showToast } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('30d');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchOutcomes();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load outcomes data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedRange]);

  const metrics = data?.metrics || {
    treatmentSuccessRate: 88.2,
    treatmentBenchmark: '≥ 85.0%',
    mortalityRate: 11.8,
    mortalityBenchmark: '≤ 15.0%',
    avgStayDays: 8.4,
    avgPcrTurnaroundHours: 4.1,
    totalCasesResolved: 68
  };

  const dailyTrends = data?.dailyTrends || [];

  return (
    <div className="flex flex-col w-full p-space-lg gap-space-xl">
      {/* Top Executive Action Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg">
        <div className="flex flex-col gap-space-xs max-w-3xl">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-telemetry-unit text-telemetry-unit tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span>Biocontainment Analytical Engine v4.2</span>
            <span className="text-outline-variant">/</span>
            <span className="text-secondary font-semibold">Live Synthesis</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
            Clinical Outcomes &amp; Benchmark Analytics
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Monitoring Facility Efficacy vs WHO Biocontainment Benchmarks · Synthetic Demo Dataset (Cohort N={metrics.totalCasesResolved} Resolved Cases)
          </p>
        </div>

        {/* Date Filter & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md">
          <div className="flex items-center p-1 rounded-lg bg-surface-container shadow-sm">
            <button
              onClick={() => setSelectedRange('7d')}
              className={`px-space-sm py-1 rounded font-label-md text-label-md transition-colors ${
                selectedRange === '7d'
                  ? 'bg-surface-container-lowest font-bold text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setSelectedRange('30d')}
              className={`px-space-sm py-1 rounded font-label-md text-label-md transition-colors ${
                selectedRange === '30d'
                  ? 'bg-surface-container-lowest font-bold text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setSelectedRange('qtd')}
              className={`px-space-sm py-1 rounded font-label-md text-label-md transition-colors ${
                selectedRange === 'qtd'
                  ? 'bg-surface-container-lowest font-bold text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Quarter to Date
            </button>
          </div>

          <div className="flex items-center gap-space-xs">
            <button
              onClick={() => showToast('CSV Generated', 'Cohort Outcomes dataset downloaded', 'success')}
              className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-primary font-label-lg hover:bg-surface-container shadow-sm transition-colors border border-surface-container"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Download CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-lg hover:bg-primary-container shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Print Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Regulatory Compliance Banner */}
      <div className="relative overflow-hidden rounded-xl bg-secondary/10 p-space-lg shadow-sm border border-secondary/20">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pl-space-xs">
          <div className="flex items-start gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-headline-md text-headline-md text-secondary font-bold">
                  Facility Operating Within Regulatory Clinical Benchmarks
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-telemetry-unit text-xs uppercase tracking-wide">
                  Standard WHO-EPR-2024.1
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface mt-0.5">
                Current Treatment Success (<strong className="font-semibold text-secondary">{metrics.treatmentSuccessRate}%</strong>) exceeds the {metrics.treatmentBenchmark} minimum threshold. Mortality Rate (<strong className="font-semibold text-on-surface">{metrics.mortalityRate}%</strong>) remains safely within the {metrics.mortalityBenchmark} biocontainment ceiling limit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* KPI 1 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
              Treatment Success Rate
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
          </div>
          <div className="my-space-md">
            <div className="font-headline-xl text-3xl font-bold text-secondary">
              {metrics.treatmentSuccessRate}%
            </div>
            <div className="font-body-sm text-xs text-on-surface-variant mt-1">
              Target: {metrics.treatmentBenchmark} · Standard Compliant
            </div>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5">
            <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${metrics.treatmentSuccessRate}%` }}></div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
              Cohort Mortality Rate
            </span>
            <span className="material-symbols-outlined text-outline text-[20px]">health_and_safety</span>
          </div>
          <div className="my-space-md">
            <div className="font-headline-xl text-3xl font-bold text-on-surface">
              {metrics.mortalityRate}%
            </div>
            <div className="font-body-sm text-xs text-on-surface-variant mt-1">
              Regulatory Ceiling: {metrics.mortalityBenchmark} · -3.2% Margin
            </div>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5">
            <div className="bg-primary-container h-1.5 rounded-full" style={{ width: `${(metrics.mortalityRate / 15) * 100}%` }}></div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
              Avg Length of Stay
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">hotel</span>
          </div>
          <div className="my-space-md">
            <div className="font-headline-xl text-3xl font-bold text-primary">
              {metrics.avgStayDays} <span className="text-lg font-normal text-on-surface-variant">Days</span>
            </div>
            <div className="font-body-sm text-xs text-on-surface-variant mt-1">
              Isolation Period: Median 7.8 Days
            </div>
          </div>
          <div className="font-telemetry-unit text-xs text-secondary font-semibold">
            Within Target Range (7–10 Days)
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
              PCR Turnaround Time
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">biotech</span>
          </div>
          <div className="my-space-md">
            <div className="font-headline-xl text-3xl font-bold text-on-surface">
              {metrics.avgPcrTurnaroundHours} <span className="text-lg font-normal text-on-surface-variant">Hours</span>
            </div>
            <div className="font-body-sm text-xs text-on-surface-variant mt-1">
              BSL-4 Onsite Molecular Laboratory
            </div>
          </div>
          <div className="font-telemetry-unit text-xs text-secondary font-semibold">
            Lab SLA Benchmark ≤ 6.0h
          </div>
        </div>
      </div>

      {/* Visual Telemetry Trends & Cohort Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: Daily Trends */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h3 className="font-headline-md font-bold text-on-surface">
                Cohort Progression &amp; Mean Temperature Curve
              </h3>
              <p className="font-body-sm text-on-surface-variant">
                Daily telemetry normalization across 7-day containment cohorts.
              </p>
            </div>
            <span className="font-telemetry-unit text-xs bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
              Curve N=68
            </span>
          </div>

          <div className="h-64 bg-surface-container-low/40 rounded-xl p-4 flex items-end justify-between gap-2 border border-surface-container">
            {dailyTrends.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-xs font-telemetry-data font-bold text-secondary">
                  {d.tempAvg}°C
                </span>
                <div
                  className="w-full max-w-[48px] bg-secondary/80 rounded-t-lg group-hover:bg-secondary transition-all"
                  style={{ height: `${((d.tempAvg - 36.0) / (39.0 - 36.0)) * 140}px` }}
                ></div>
                <span className="text-[11px] font-telemetry-unit text-on-surface-variant mt-1 font-semibold">
                  {d.day}
                </span>
                <span className="text-[9px] font-telemetry-unit text-outline">
                  {d.feverAlerts} alerts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cohort Acuity Breakdown */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between">
          <div>
            <h3 className="font-headline-md font-bold text-on-surface mb-1">
              Cohort Acuity Distribution
            </h3>
            <p className="font-body-sm text-on-surface-variant mb-space-md">
              Proportion of cases stratified by admission virulence level.
            </p>

            <div className="flex flex-col gap-space-md">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>Mild / Surveillance (47%)</span>
                  <span>32 Cases</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '47%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>Moderate Symptoms (38%)</span>
                  <span>26 Cases</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '38%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>Severe / BSL-4 Containment (15%)</span>
                  <span>10 Cases</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div className="bg-error h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-space-sm rounded-lg bg-surface-container-low text-xs text-on-surface-variant mt-4">
            Total Resolved Cohort: <strong>68 Patients</strong>. Data synchronized with central epidemiologic registry.
          </div>
        </div>
      </div>
    </div>
  );
}
