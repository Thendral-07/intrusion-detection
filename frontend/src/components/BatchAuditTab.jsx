import React, { useState } from 'react';
import { Upload, Download, Search, FileText, CheckCircle, AlertOctagon, Layers } from 'lucide-react';

export default function BatchAuditTab({ globalThreshold }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [batchResults, setBatchResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, INTRUSION, NORMAL

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const runBatchScan = async (sampleCount = null) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('threshold', globalThreshold);

      if (selectedFile && !sampleCount) {
        formData.append('file', selectedFile);
      }

      const res = await fetch('/api/predict-batch', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setBatchResults(data);
      } else {
        const err = await res.json();
        alert(`Batch Scan Error: ${err.detail || 'Upload failed'}`);
      }
    } catch (err) {
      console.error('Batch scan failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!batchResults || !batchResults.records) return;
    const records = batchResults.records;
    const headers = [
      'session_id',
      'protocol_type',
      'network_packet_size',
      'login_attempts',
      'session_duration',
      'ip_reputation_score',
      'failed_logins',
      'encryption_used',
      'browser_type',
      'threat_probability',
      'threat_percentage',
      'is_intrusion',
      'severity',
      'recommended_action',
    ];

    const csvRows = [
      headers.join(','),
      ...records.map((r) =>
        [
          r.session_id,
          r.input_features.protocol_type,
          r.input_features.network_packet_size,
          r.input_features.login_attempts,
          r.input_features.session_duration,
          r.input_features.ip_reputation_score,
          r.input_features.failed_logins,
          r.input_features.encryption_used,
          r.input_features.browser_type,
          r.threat_probability,
          r.threat_percentage,
          r.is_intrusion ? 1 : 0,
          r.severity,
          `"${r.recommended_action}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybersoc_audit_report_threshold_${globalThreshold}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered records
  const filteredRecords = (batchResults?.records || []).filter((r) => {
    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'INTRUSION' && r.is_intrusion) ||
      (filterType === 'NORMAL' && !r.is_intrusion);

    const matchesSearch =
      r.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.input_features.protocol_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.severity.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Forge Dropzone & Scanner Card */}
      <article className="forge-spec">
        <header className="forge-spec__bar">
          <span className="forge-spec__id">07</span>
          <span className="forge-spec__title">BULK AUDIT INGESTION & DATASET TEST</span>
          <span className="forge-spec__status">CSV BATCH PROCESSOR</span>
        </header>

        <div className="forge-spec__body">
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', marginTop: 0 }}>
            Upload custom network capture logs (single log or bulk CSV) or trigger instant batch audits directly from{' '}
            <code style={{ color: 'var(--color-text)' }}>cybersecurity_intrusion_data.csv</code>. Evaluates every connection record through the{' '}
            <code style={{ color: 'var(--color-text)' }}>RandomForest</code> production model bundle.
          </p>

          {/* File Upload / Dropzone */}
          <div
            style={{
              border: '1px dashed var(--color-border-strong)',
              padding: '2rem',
              textAlign: 'center',
              background: selectedFile ? 'rgba(255, 255, 255, 0.02)' : 'var(--color-slate)',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'background var(--duration-fast) var(--ease-out)',
            }}
            onClick={() => document.getElementById('batchCsvInput').click()}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border-strong)'}
          >
            <input
              type="file"
              id="batchCsvInput"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Upload size={28} color="var(--color-accent)" />
            <div style={{ fontWeight: 600, fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text)' }}>
              {selectedFile ? `SELECTED: ${selectedFile.name}` : 'DRAG & DROP CSV LOG FILE OR CLICK TO BROWSE'}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Supports session_id, network_packet_size, protocol_type, login_attempts, etc.
            </span>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="forge-btn forge-btn--primary"
              disabled={loading || !selectedFile}
              onClick={() => runBatchScan()}
            >
              Scan Uploaded CSV
            </button>

            <button
              type="button"
              className="forge-btn forge-btn--ghost"
              style={{ border: '1px solid var(--color-border)' }}
              disabled={loading}
              onClick={() => runBatchScan(50)}
            >
              Audit 50 Dataset Samples
            </button>

            <button
              type="button"
              className="forge-btn forge-btn--ghost"
              style={{ border: '1px solid var(--color-border)' }}
              disabled={loading}
              onClick={() => runBatchScan(200)}
            >
              High-Throughput Scan
            </button>
          </div>
        </div>

        <div style={{ 
          borderTop: '1px solid var(--color-border)', 
          background: 'var(--color-slate)', 
          padding: '0.75rem 1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span className="forge-spec__status">CALIBRATED THRESHOLD: {globalThreshold}</span>
          <span className="forge-spec__tag">PARALLEL INGESTION</span>
        </div>
      </article>

      {/* Summary Metrics & Scored Table */}
      {batchResults && (
        <article className="forge-spec">
          <header className="forge-spec__bar">
            <span className="forge-spec__id">08</span>
            <span className="forge-spec__title" style={{ flex: 1 }}>BATCH AUDIT VERDICT SUMMARY</span>
            <button
              type="button"
              className="forge-btn forge-btn--ghost"
              style={{ padding: '0 12px', height: '28px', fontSize: '11px', border: '1px solid var(--color-border-strong)' }}
              onClick={handleExportCsv}
            >
              <Download size={12} style={{ marginRight: '6px' }} /> Export Report (.csv)
            </button>
          </header>

          <div className="forge-spec__body">
            
            {/* 4 Summary Stat Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div style={{ border: '1px solid var(--color-border)', padding: '1rem', background: 'var(--color-slate)', borderRadius: '4px' }}>
                <span className="forge-spec__eyebrow">TOTAL SCANNED</span>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '2rem', fontWeight: 900, color: 'var(--color-text)' }}>
                  {batchResults.summary.total_scanned}
                </div>
              </div>

              <div style={{ border: '1px solid var(--color-signal)', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
                <span className="forge-spec__eyebrow" style={{ color: 'var(--color-signal)' }}>INTRUSIONS BLOCKED</span>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '2rem', fontWeight: 900, color: 'var(--color-signal)' }}>
                  {batchResults.summary.intrusions_blocked}
                </div>
              </div>

              <div style={{ border: '1px solid var(--color-acid)', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px' }}>
                <span className="forge-spec__eyebrow" style={{ color: 'var(--color-acid)' }}>NORMAL TRAFFIC</span>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '2rem', fontWeight: 900, color: 'var(--color-acid)' }}>
                  {batchResults.summary.normal_traffic}
                </div>
              </div>

              <div style={{ border: '1px solid var(--color-border)', padding: '1rem', background: 'var(--color-slate)', borderRadius: '4px' }}>
                <span className="forge-spec__eyebrow">THREAT RATIO</span>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '2rem', fontWeight: 900, color: 'var(--color-text)' }}>
                  {batchResults.summary.threat_rate_percentage}%
                </div>
              </div>
            </div>

            {/* Search & Filter Group */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
              
              {/* Forge Search Component */}
              <div className="forge-field" style={{ maxWidth: '380px' }}>
                <label className="forge-field__label">Search Audit Logs</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="search"
                    className="forge-field__input"
                    placeholder="Filter by Session, Protocol, Severity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="button" className="forge-btn forge-btn--primary" style={{ padding: '0 12px' }}>
                    <Search size={16} />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[
                  { label: 'All Records', val: 'ALL' },
                  { label: 'Threats Only', val: 'INTRUSION' },
                  { label: 'Clean Only', val: 'NORMAL' },
                ].map((f) => (
                  <button
                    key={f.val}
                    type="button"
                    className="forge-btn forge-btn--ghost"
                    style={{
                      padding: '0.4rem 0.85rem',
                      minHeight: '36px',
                      fontSize: '0.75rem',
                      background: filterType === f.val ? 'var(--color-graphite)' : 'transparent',
                      color: filterType === f.val ? 'var(--color-text)' : 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)'
                    }}
                    onClick={() => setFilterType(f.val)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scored Data Table */}
            <div className="forge-table-wrap" style={{ marginTop: '1.5rem', maxHeight: '420px', background: 'transparent' }}>
              <table className="forge-table">
                <thead>
                  <tr>
                    <th>SESSION ID</th>
                    <th>PROTOCOL</th>
                    <th>SIZE</th>
                    <th>FAILS</th>
                    <th>IP REP</th>
                    <th>ENCRYPTION</th>
                    <th>THREAT %</th>
                    <th>OUTCOME</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                        No records match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r, i) => (
                      <tr key={`${r.session_id}-${i}`}>
                        <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{r.session_id}</td>
                        <td>{r.input_features.protocol_type}</td>
                        <td>{r.input_features.network_packet_size} B</td>
                        <td>{r.input_features.failed_logins}</td>
                        <td>{r.input_features.ip_reputation_score}</td>
                        <td>{r.input_features.encryption_used}</td>
                        <td style={{ fontWeight: 800, color: r.is_intrusion ? 'var(--color-signal)' : 'var(--color-text)' }}>{r.threat_percentage}%</td>
                        <td>
                          <span
                            className={`forge-spec__tag ${
                              r.is_intrusion ? 'forge-spec__tag--signal' : 'forge-spec__tag--acid'
                            }`}
                            style={{ background: r.is_intrusion ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}
                          >
                            {r.is_intrusion ? 'BLOCKED' : 'CLEAN'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

          <div style={{ 
            borderTop: '1px solid var(--color-border)', 
            background: 'var(--color-slate)', 
            padding: '0.75rem 1.5rem', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span className="forge-spec__status">TOTAL FILTERED: {filteredRecords.length} ROWS</span>
            <button type="button" className="forge-btn forge-btn--ghost" style={{ padding: '0 12px', height: '24px', fontSize: '11px', border: '1px solid var(--color-border)' }} onClick={handleExportCsv}>
              Download CSV
            </button>
          </div>
        </article>
      )}

    </div>
  );
}
