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
      
      {/* Broadside Dropzone & Scanner Card */}
      <div className="broadside-card broadside-card--offset">
        <header className="broadside-card__header broadside-card__header--dark">
          <span>BULK AUDIT INGESTION & DATASET TEST</span>
          <span className="broadside-card__meta">CSV BATCH PROCESSOR</span>
        </header>

        <div className="broadside-card__body">
          <p className="broadside-card__text">
            Upload custom network capture logs (single log or bulk CSV) or trigger instant batch audits directly from{' '}
            <code>cybersecurity_intrusion_data.csv</code>. Evaluates every connection record through the{' '}
            <code>RandomForest</code> production model bundle.
          </p>

          {/* File Upload / Dropzone */}
          <div
            style={{
              border: 'var(--rule) dashed var(--color-ink)',
              padding: '2rem',
              textAlign: 'center',
              background: selectedFile ? 'var(--color-bone)' : 'var(--color-stock)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
            onClick={() => document.getElementById('batchCsvInput').click()}
          >
            <input
              type="file"
              id="batchCsvInput"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Upload size={36} color="var(--color-signal)" />
            <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {selectedFile ? `SELECTED: ${selectedFile.name}` : 'DRAG & DROP CSV LOG FILE OR CLICK TO BROWSE'}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Supports session_id, network_packet_size, protocol_type, login_attempts, etc.
            </span>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="broadside-btn broadside-btn--primary"
              disabled={loading || !selectedFile}
              onClick={() => runBatchScan()}
            >
              🚀 Scan Uploaded CSV
            </button>

            <button
              type="button"
              className="broadside-btn broadside-btn--cobalt"
              disabled={loading}
              onClick={() => runBatchScan(50)}
            >
              🎲 Audit 50 Dataset Samples
            </button>

            <button
              type="button"
              className="broadside-btn broadside-btn--acid"
              disabled={loading}
              onClick={() => runBatchScan(200)}
            >
              ⚡ High-Throughput Scan
            </button>
          </div>
        </div>

        <footer className="broadside-card__footer">
          <span className="broadside-card__meta">CALIBRATED THRESHOLD: {globalThreshold}</span>
          <span className="broadside-card__tag">PARALLEL INGESTION</span>
        </footer>
      </div>

      {/* Summary Metrics & Scored Table */}
      {batchResults && (
        <div className="broadside-card broadside-card--offset">
          <header className="broadside-card__header broadside-card__header--acid">
            <span>BATCH AUDIT VERDICT SUMMARY</span>
            <button
              type="button"
              className="broadside-btn broadside-btn--primary"
              style={{ padding: '0.4rem 0.85rem', minHeight: '34px', fontSize: '0.75rem' }}
              onClick={handleExportCsv}
            >
              <Download size={14} /> Export Scored Report (.csv)
            </button>
          </header>

          <div className="broadside-card__body">
            
            {/* 4 Summary Stat Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div style={{ border: 'var(--rule) solid var(--color-ink)', padding: '1rem', background: 'var(--color-bone)' }}>
                <span className="broadside-field__label">TOTAL SCANNED</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900 }}>
                  {batchResults.summary.total_scanned}
                </div>
              </div>

              <div style={{ border: 'var(--rule) solid var(--color-ink)', padding: '1rem', background: 'var(--color-signal)', color: '#fff' }}>
                <span className="broadside-field__label" style={{ color: '#fff' }}>INTRUSIONS BLOCKED</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900 }}>
                  {batchResults.summary.intrusions_blocked}
                </div>
              </div>

              <div style={{ border: 'var(--rule) solid var(--color-ink)', padding: '1rem', background: 'var(--color-acid)', color: 'var(--color-ink)' }}>
                <span className="broadside-field__label">NORMAL TRAFFIC</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900 }}>
                  {batchResults.summary.normal_traffic}
                </div>
              </div>

              <div style={{ border: 'var(--rule) solid var(--color-ink)', padding: '1rem', background: 'var(--color-stock)' }}>
                <span className="broadside-field__label">THREAT RATIO</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900 }}>
                  {batchResults.summary.threat_rate_percentage}%
                </div>
              </div>
            </div>

            {/* Broadside Search & Filter Group */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
              
              {/* Broadside Search Component */}
              <div className="broadside-search" style={{ maxWidth: '380px' }}>
                <span className="broadside-search__label">Search Audit Logs</span>
                <div className="broadside-search__group">
                  <input
                    type="search"
                    className="broadside-search__input"
                    placeholder="Filter by Session, Protocol, Severity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="button" className="broadside-search__btn">
                    Find <Search size={14} />
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
                    className={`broadside-btn broadside-btn--ghost`}
                    style={{
                      padding: '0.4rem 0.85rem',
                      minHeight: '36px',
                      fontSize: '0.75rem',
                      background: filterType === f.val ? 'var(--color-ink)' : 'var(--color-stock)',
                      color: filterType === f.val ? 'var(--color-acid)' : 'var(--color-ink)',
                    }}
                    onClick={() => setFilterType(f.val)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scored Data Table */}
            <div className="broadside-table-wrap" style={{ marginTop: '0.75rem', maxHeight: '420px' }}>
              <table className="broadside-table">
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
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                        No records match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r, i) => (
                      <tr key={`${r.session_id}-${i}`}>
                        <td style={{ fontWeight: 800 }}>{r.session_id}</td>
                        <td>{r.input_features.protocol_type}</td>
                        <td>{r.input_features.network_packet_size} B</td>
                        <td>{r.input_features.failed_logins}</td>
                        <td>{r.input_features.ip_reputation_score}</td>
                        <td>{r.input_features.encryption_used}</td>
                        <td style={{ fontWeight: 800 }}>{r.threat_percentage}%</td>
                        <td>
                          <span
                            className={`broadside-pill ${
                              r.is_intrusion ? 'broadside-pill--signal' : 'broadside-pill--acid'
                            }`}
                          >
                            {r.is_intrusion ? '🚨 BLOCKED' : '🟩 CLEAN'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

          <footer className="broadside-card__footer">
            <span className="broadside-card__meta">TOTAL FILTERED: {filteredRecords.length} ROWS</span>
            <button type="button" className="broadside-card__action" onClick={handleExportCsv}>
              Download CSV
            </button>
          </footer>
        </div>
      )}

    </div>
  );
}
