import React, { useState, useEffect } from 'react';
import { Zap, RefreshCw, AlertTriangle, CheckCircle, Shield, ChevronDown, ChevronUp, Globe, Key, Lock, Cpu } from 'lucide-react';

export default function InspectorTab({ globalThreshold }) {
  const [formData, setFormData] = useState({
    session_id: 'SID_INSPECT_01',
    network_packet_size: 450,
    protocol_type: 'TCP',
    login_attempts: 2,
    session_duration: 600,
    encryption_used: 'AES',
    ip_reputation_score: 0.28,
    failed_logins: 0,
    browser_type: 'Chrome',
    unusual_time_access: 0,
  });

  const [showAdvancedNetwork, setShowAdvancedNetwork] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async (customData = null) => {
    setLoading(true);
    const payload = customData || formData;
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          decision_threshold: globalThreshold,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDiagnosticResult(data);
      }
    } catch (err) {
      console.error('Error during prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, [globalThreshold]);

  // Quick IP Reputation Tier Selectors
  const setIpTier = (tierScore) => {
    const updated = { ...formData, ip_reputation_score: tierScore };
    setFormData(updated);
    runDiagnostic(updated);
  };

  const getIpTierLabel = (score) => {
    if (score <= 0.30) return { label: '🟢 CLEAN / VERIFIED IP', color: 'var(--color-acid)' };
    if (score <= 0.55) return { label: '🟡 NEUTRAL / UNKNOWN IP', color: 'var(--color-stock)' };
    if (score <= 0.80) return { label: '🟠 SUSPICIOUS / PROXY IP', color: 'var(--color-signal)' };
    return { label: '🚨 HIGH-RISK BLACKLISTED IP', color: 'var(--color-signal)' };
  };

  const loadPreset = (preset) => {
    let updated = { ...formData };
    if (preset === 'brute-force') {
      updated = {
        ...formData,
        network_packet_size: 650,
        protocol_type: 'TCP',
        login_attempts: 11,
        session_duration: 15,
        encryption_used: 'None',
        ip_reputation_score: 0.78,
        failed_logins: 5,
        browser_type: 'Chrome',
        unusual_time_access: 1,
      };
    } else if (preset === 'packet-flood') {
      updated = {
        ...formData,
        network_packet_size: 1250,
        protocol_type: 'UDP',
        login_attempts: 6,
        session_duration: 15,
        encryption_used: 'DES',
        ip_reputation_score: 0.65,
        failed_logins: 3,
        browser_type: 'Chrome',
        unusual_time_access: 0,
      };
    } else if (preset === 'shadow-access') {
      updated = {
        ...formData,
        network_packet_size: 780,
        protocol_type: 'TCP',
        login_attempts: 6,
        session_duration: 90,
        encryption_used: 'None',
        ip_reputation_score: 0.72,
        failed_logins: 4,
        browser_type: 'Unknown',
        unusual_time_access: 1,
      };
    } else if (preset === 'legitimate') {
      updated = {
        ...formData,
        network_packet_size: 450,
        protocol_type: 'TCP',
        login_attempts: 2,
        session_duration: 1200,
        encryption_used: 'AES',
        ip_reputation_score: 0.28,
        failed_logins: 0,
        browser_type: 'Firefox',
        unusual_time_access: 0,
      };
    }
    setFormData(updated);
    runDiagnostic(updated);
  };

  const loadRandomSampleFromDataset = async () => {
    try {
      const res = await fetch('/api/stream-feed?count=1');
      if (res.ok) {
        const data = await res.json();
        if (data.events && data.events.length > 0) {
          const sample = data.events[0].input_features;
          const updated = {
            session_id: data.events[0].session_id || 'SID_DATASET',
            network_packet_size: sample.network_packet_size,
            protocol_type: sample.protocol_type,
            login_attempts: sample.login_attempts,
            session_duration: Math.round(sample.session_duration),
            encryption_used: sample.encryption_used === 'Unknown' ? 'None' : sample.encryption_used,
            ip_reputation_score: Number(sample.ip_reputation_score.toFixed(2)),
            failed_logins: sample.failed_logins,
            browser_type: sample.browser_type,
            unusual_time_access: sample.unusual_time_access,
          };
          setFormData(updated);
          runDiagnostic(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load random sample:', err);
    }
  };

  const currentTier = getIpTierLabel(formData.ip_reputation_score);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
      
      {/* Left: Interactive Broadside Form */}
      <div className="broadside-card broadside-card--offset">
        <header className="broadside-card__header broadside-card__header--dark">
          <span>EVENT PARAMETER INSPECTOR</span>
          <span className="broadside-card__meta">EASY THREAT SIMULATOR</span>
        </header>

        <div className="broadside-card__body">
          
          {/* 1-Click Preset Attack Scenarios */}
          <div>
            <span className="broadside-field__label">QUICK ATTACK SCENARIOS:</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.35rem' }}>
              <button
                type="button"
                className="broadside-btn broadside-btn--primary"
                style={{ fontSize: '0.75rem', padding: '0.5rem', minHeight: '38px' }}
                onClick={() => loadPreset('brute-force')}
              >
                💥 Brute Force Attack
              </button>
              <button
                type="button"
                className="broadside-btn broadside-btn--cobalt"
                style={{ fontSize: '0.75rem', padding: '0.5rem', minHeight: '38px' }}
                onClick={() => loadPreset('packet-flood')}
              >
                🌊 Traffic Surge
              </button>
              <button
                type="button"
                className="broadside-btn broadside-btn--ghost"
                style={{ fontSize: '0.75rem', padding: '0.5rem', minHeight: '38px' }}
                onClick={() => loadPreset('shadow-access')}
              >
                🕵️ Off-Hours Access
              </button>
              <button
                type="button"
                className="broadside-btn broadside-btn--acid"
                style={{ fontSize: '0.75rem', padding: '0.5rem', minHeight: '38px' }}
                onClick={() => loadPreset('legitimate')}
              >
                🛡️ Safe Verified User
              </button>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: 'var(--rule) solid var(--color-ink)', margin: '0.25rem 0' }} />

          {/* ================================================================= */}
          {/* PRIMARY FEATURE: IP REPUTATION (DEFAULT + SELECTIVE TIERS) */}
          {/* ================================================================= */}
          <div
            style={{
              border: 'var(--rule) solid var(--color-ink)',
              padding: '1rem',
              background: 'var(--color-bone)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="broadside-field__label" style={{ fontSize: '0.85rem' }}>
                🌐 IP REPUTATION & THREAT INTELLIGENCE:
              </span>
              <span className="broadside-field__val-tag" style={{ fontSize: '0.9rem' }}>
                Score: {formData.ip_reputation_score}
              </span>
            </div>

            {/* Quick Selective Tier Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
              <button
                type="button"
                className={`broadside-btn broadside-btn--ghost`}
                style={{
                  padding: '0.4rem 0.65rem',
                  minHeight: '36px',
                  fontSize: '0.7rem',
                  background: formData.ip_reputation_score <= 0.30 ? 'var(--color-acid)' : 'var(--color-stock)',
                  color: 'var(--color-ink)',
                  border: 'var(--rule) solid var(--color-ink)',
                  fontWeight: 800,
                }}
                onClick={() => setIpTier(0.25)}
              >
                🟢 Verified Trusted (0.25)
              </button>

              <button
                type="button"
                className={`broadside-btn broadside-btn--ghost`}
                style={{
                  padding: '0.4rem 0.65rem',
                  minHeight: '36px',
                  fontSize: '0.7rem',
                  background: formData.ip_reputation_score > 0.30 && formData.ip_reputation_score <= 0.55 ? 'var(--color-ink)' : 'var(--color-stock)',
                  color: formData.ip_reputation_score > 0.30 && formData.ip_reputation_score <= 0.55 ? '#fff' : 'var(--color-ink)',
                  border: 'var(--rule) solid var(--color-ink)',
                  fontWeight: 800,
                }}
                onClick={() => setIpTier(0.48)}
              >
                🟡 Neutral / ISP (0.48)
              </button>

              <button
                type="button"
                className={`broadside-btn broadside-btn--ghost`}
                style={{
                  padding: '0.4rem 0.65rem',
                  minHeight: '36px',
                  fontSize: '0.7rem',
                  background: formData.ip_reputation_score > 0.55 && formData.ip_reputation_score <= 0.80 ? 'var(--color-cobalt)' : 'var(--color-stock)',
                  color: formData.ip_reputation_score > 0.55 && formData.ip_reputation_score <= 0.80 ? '#fff' : 'var(--color-ink)',
                  border: 'var(--rule) solid var(--color-ink)',
                  fontWeight: 800,
                }}
                onClick={() => setIpTier(0.75)}
              >
                🟠 Suspicious Proxy (0.75)
              </button>

              <button
                type="button"
                className={`broadside-btn broadside-btn--ghost`}
                style={{
                  padding: '0.4rem 0.65rem',
                  minHeight: '36px',
                  fontSize: '0.7rem',
                  background: formData.ip_reputation_score > 0.80 ? 'var(--color-signal)' : 'var(--color-stock)',
                  color: formData.ip_reputation_score > 0.80 ? '#fff' : 'var(--color-ink)',
                  border: 'var(--rule) solid var(--color-ink)',
                  fontWeight: 800,
                }}
                onClick={() => setIpTier(0.92)}
              >
                🔴 Known Malicious (0.92)
              </button>
            </div>

            {/* Continuous Fine-Tune Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                <span>0.00 (Zero Threat)</span>
                <span style={{ fontWeight: 800, color: 'var(--color-ink)' }}>{currentTier.label}</span>
                <span>1.00 (Max Risk)</span>
              </div>
              <input
                type="range"
                className="broadside-slider"
                min="0.01"
                max="0.99"
                step="0.01"
                value={formData.ip_reputation_score}
                onChange={(e) => setFormData({ ...formData, ip_reputation_score: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* ================================================================= */}
          {/* PRIMARY USER-FRIENDLY CONTROLS: LOGIN ATTEMPTS & FAILED LOGINS */}
          {/* ================================================================= */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '0.25rem' }}>
            
            {/* Login Attempts */}
            <div className="broadside-field">
              <label className="broadside-field__label">
                <span>Login Attempts</span>
                <span className="broadside-field__val-tag">{formData.login_attempts}</span>
              </label>
              <input
                type="range"
                className="broadside-slider"
                min="1"
                max="15"
                value={formData.login_attempts}
                onChange={(e) => setFormData({ ...formData, login_attempts: Number(e.target.value) })}
              />
              <span className="broadside-field__hint">Normal users: 1 - 3 attempts</span>
            </div>

            {/* Failed Logins */}
            <div className="broadside-field">
              <label className="broadside-field__label">
                <span>Failed Logins</span>
                <span className="broadside-field__val-tag" style={{ background: 'var(--color-signal)', color: '#fff' }}>
                  {formData.failed_logins}
                </span>
              </label>
              <input
                type="range"
                className="broadside-slider"
                min="0"
                max="6"
                value={formData.failed_logins}
                onChange={(e) => setFormData({ ...formData, failed_logins: Number(e.target.value) })}
              />
              <span className="broadside-field__hint">Consecutive failed passwords</span>
            </div>

            {/* Encryption Standard */}
            <div className="broadside-field">
              <label className="broadside-field__label">Security / Encryption</label>
              <select
                className="broadside-field__select"
                value={formData.encryption_used}
                onChange={(e) => setFormData({ ...formData, encryption_used: e.target.value })}
              >
                <option value="AES">AES (Secure Encrypted)</option>
                <option value="DES">DES (Weak Legacy Crypto)</option>
                <option value="None">None (Unencrypted Plaintext)</option>
              </select>
            </div>

            {/* Browser / Client */}
            <div className="broadside-field">
              <label className="broadside-field__label">Browser / Client Agent</label>
              <select
                className="broadside-field__select"
                value={formData.browser_type}
                onChange={(e) => setFormData({ ...formData, browser_type: e.target.value })}
              >
                <option value="Chrome">Google Chrome</option>
                <option value="Firefox">Mozilla Firefox</option>
                <option value="Edge">Microsoft Edge</option>
                <option value="Safari">Apple Safari</option>
                <option value="Unknown">Unknown (Automated Script/Bot)</option>
              </select>
            </div>
          </div>

          {/* Broadside Switch: Off-Hours Access */}
          <div style={{ padding: '0.75rem', background: 'var(--color-stock)', border: 'var(--rule) solid var(--color-ink)', marginTop: '0.25rem' }}>
            <label className="broadside-switch">
              <input
                type="checkbox"
                className="broadside-switch__input"
                checked={formData.unusual_time_access === 1}
                onChange={(e) => setFormData({ ...formData, unusual_time_access: e.target.checked ? 1 : 0 })}
              />
              <span className="broadside-switch__track"></span>
              <span className="broadside-switch__label">Flag Off-Hours Operational Access</span>
            </label>
          </div>

          {/* ================================================================= */}
          {/* COLLAPSIBLE ADVANCED NETWORK PARAMETERS (PROTOCOL & PACKET SIZE) */}
          {/* ================================================================= */}
          <div style={{ marginTop: '0.5rem', border: 'var(--rule) solid var(--color-ink)', background: 'var(--color-paper)' }}>
            <button
              type="button"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--color-stock)',
                border: 'none',
                borderBottom: showAdvancedNetwork ? 'var(--rule) solid var(--color-ink)' : 'none',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
              onClick={() => setShowAdvancedNetwork(!showAdvancedNetwork)}
            >
              <span>⚙️ Advanced Technical Parameters (Protocol & Packet Size)</span>
              {showAdvancedNetwork ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showAdvancedNetwork ? (
              <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div className="broadside-field">
                  <label className="broadside-field__label">
                    <span>Packet Size</span>
                    <span className="broadside-field__val-tag">{formData.network_packet_size}B</span>
                  </label>
                  <input
                    type="range"
                    className="broadside-slider"
                    min="64"
                    max="1500"
                    value={formData.network_packet_size}
                    onChange={(e) => setFormData({ ...formData, network_packet_size: Number(e.target.value) })}
                  />
                  <span className="broadside-field__hint">Default: 450 B</span>
                </div>

                <div className="broadside-field">
                  <label className="broadside-field__label">Protocol</label>
                  <select
                    className="broadside-field__select"
                    value={formData.protocol_type}
                    onChange={(e) => setFormData({ ...formData, protocol_type: e.target.value })}
                  >
                    <option value="TCP">TCP (Default)</option>
                    <option value="UDP">UDP (Datagram)</option>
                    <option value="ICMP">ICMP (Ping)</option>
                  </select>
                </div>

                <div className="broadside-field">
                  <label className="broadside-field__label">
                    <span>Duration</span>
                    <span className="broadside-field__val-tag">{formData.session_duration}s</span>
                  </label>
                  <input
                    type="range"
                    className="broadside-slider"
                    min="1"
                    max="5000"
                    step="10"
                    value={formData.session_duration}
                    onChange={(e) => setFormData({ ...formData, session_duration: Number(e.target.value) })}
                  />
                </div>
              </div>
            ) : (
              <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                Auto-Managed Defaults: Protocol={formData.protocol_type} | Packet Size={formData.network_packet_size}B | Duration={formData.session_duration}s
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              className="broadside-btn broadside-btn--primary broadside-btn--offset"
              style={{ flex: 1 }}
              onClick={() => runDiagnostic()}
            >
              <Zap size={18} /> RUN DIAGNOSTIC
            </button>
            <button
              type="button"
              className="broadside-btn broadside-btn--ghost"
              style={{ flex: 1 }}
              onClick={() => loadRandomSampleFromDataset()}
            >
              🎲 Random Dataset Sample
            </button>
          </div>
        </div>

        <footer className="broadside-card__footer">
          <span className="broadside-card__meta">DECISION THRESHOLD: {globalThreshold}</span>
          <span className="broadside-card__tag">SOC INTELLIGENCE</span>
        </footer>
      </div>

      {/* Right: Broadside Diagnostic Verdict Card */}
      <div className="broadside-card broadside-card--offset">
        <header className={`broadside-card__header ${diagnosticResult?.is_intrusion ? 'broadside-card__header--signal' : 'broadside-card__header--acid'}`}>
          <span>ML DIAGNOSTIC VERDICT</span>
          <span className={`broadside-card__tag ${diagnosticResult?.is_intrusion ? 'broadside-card__tag--signal' : 'broadside-card__tag--acid'}`}>
            {diagnosticResult?.is_intrusion ? 'ATTACK DETECTED' : 'NO ATTACK DETECTED'}
          </span>
        </header>

        <div className="broadside-card__body">
          {diagnosticResult ? (
            <>
              {/* Verdict Header Banner */}
              <div
                style={{
                  border: `2px solid ${diagnosticResult.is_intrusion ? '#EF4444' : '#10B981'}`,
                  borderRadius: '4px',
                  padding: '1.5rem 1.25rem',
                  background: diagnosticResult.is_intrusion ? '#FEF2F2' : '#F0FDF4',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color: diagnosticResult.is_intrusion ? '#EF4444' : '#10B981',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  {diagnosticResult.is_intrusion ? '🚨 ATTACK DETECTED' : '✅ NO ATTACK DETECTED'}
                </div>
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted)',
                }}>
                  {diagnosticResult.is_intrusion ? 'INTRUSION BLOCKED — THREAT CONFIRMED' : 'LEGITIMATE TRAFFIC — SESSION AUTHORIZED'}
                </div>
                <div style={{
                  marginTop: '0.75rem',
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  background: 'var(--color-stock)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-muted)',
                }}>
                  ML CONFIDENCE: {diagnosticResult.threat_percentage}%
                </div>
              </div>

              {/* Feature Attribution Drivers */}
              <div>
                <span className="broadside-field__label">TOP RISK FACTORS DETECTED:</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {diagnosticResult.risk_factors.map((rf, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0.75rem',
                        border: 'var(--rule) solid var(--color-ink)',
                        background: rf.level === 'danger' ? 'var(--color-signal)' : rf.level === 'warning' ? 'var(--color-stock)' : 'var(--color-bone)',
                        color: rf.level === 'danger' ? '#fff' : 'var(--color-ink)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      <span>{rf.factor}</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{rf.weight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Incident Response Action */}
              <div
                style={{
                  padding: '1rem',
                  background: 'var(--color-bone)',
                  border: 'var(--rule) solid var(--color-ink)',
                }}
              >
                <span className="broadside-field__label" style={{ color: 'var(--color-signal)' }}>
                  RECOMMENDED INCIDENT RESPONSE:
                </span>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.25rem' }}>
                  {diagnosticResult.recommended_action}
                </p>
              </div>

              {/* Feature Vector Payload Inspection */}
              <div style={{ background: 'var(--color-stock)', padding: '0.75rem', border: 'var(--rule) solid var(--color-ink)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <div><strong>CONFIGURED EVENT:</strong> IP_Score={formData.ip_reputation_score} | Fails={formData.failed_logins} | Attempts={formData.login_attempts} | Proto={formData.protocol_type} | Packet={formData.network_packet_size}B</div>
              </div>
            </>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center' }}>Running diagnostic...</div>
          )}
        </div>

        <footer className="broadside-card__footer">
          <span className="broadside-card__meta">PIPELINE: RANDOMFOREST (300 ESTIMATORS)</span>
          <button type="button" className="broadside-card__action" onClick={() => runDiagnostic()}>
            Re-Score
          </button>
        </footer>
      </div>

    </div>
  );
}
