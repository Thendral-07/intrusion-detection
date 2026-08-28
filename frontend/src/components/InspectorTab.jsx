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
    if (score <= 0.30) return { label: 'CLEAN / VERIFIED IP', class: 'forge-spec__status--acid' };
    if (score <= 0.55) return { label: 'NEUTRAL / UNKNOWN IP', class: '' };
    if (score <= 0.80) return { label: 'SUSPICIOUS / PROXY IP', class: 'forge-spec__status--cobalt' };
    return { label: 'HIGH-RISK BLACKLISTED IP', class: 'forge-spec__status--signal' };
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Quick Scenarios */}
      <article className="forge-spec">
        <header className="forge-spec__bar">
          <span className="forge-spec__id">00</span>
          <span className="forge-spec__title">QUICK PRESET SCENARIOS</span>
          <span className="forge-spec__status">1-CLICK</span>
        </header>
        <div className="forge-spec__body" style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
              <button
                type="button"
                className="forge-btn forge-btn--primary"
                onClick={() => loadPreset('brute-force')}
              >
                Brute Force
              </button>
              <button
                type="button"
                className="forge-btn forge-btn--ghost"
                style={{ border: '1px solid var(--color-cobalt)', color: 'var(--color-cobalt)' }}
                onClick={() => loadPreset('packet-flood')}
              >
                Traffic Surge
              </button>
              <button
                type="button"
                className="forge-btn forge-btn--ghost"
                onClick={() => loadPreset('shadow-access')}
              >
                Off-Hours
              </button>
              <button
                type="button"
                className="forge-btn forge-btn--ghost"
                style={{ border: '1px solid var(--color-acid)', color: 'var(--color-acid)' }}
                onClick={() => loadPreset('legitimate')}
              >
                Verified Safe
              </button>
            </div>
        </div>
      </article>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
      
      {/* Left: Interactive Forge Form */}
      <article className="forge-spec">
        <header className="forge-spec__bar">
          <span className="forge-spec__id">01</span>
          <span className="forge-spec__title">CUSTOM ATTACK PARAMETERS</span>
          <span className="forge-spec__status">MANUAL SIMULATOR</span>
        </header>

        <div className="forge-spec__body">
          
          {/* ================================================================= */}
          {/* PRIMARY FEATURE: IP REPUTATION (DEFAULT + SELECTIVE TIERS) */}
          {/* ================================================================= */}
          <div
            style={{
              border: '1px solid var(--color-border)',
              padding: '1rem',
              background: 'var(--color-slate)',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="forge-spec__eyebrow" style={{ marginBottom: 0 }}>
                IP REPUTATION & THREAT INTELLIGENCE
              </span>
              <span className="forge-spec__tag">
                Score: {formData.ip_reputation_score}
              </span>
            </div>

            {/* Quick Selective Tier Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
              <button
                type="button"
                className="forge-btn forge-btn--ghost"
                style={{
                  fontSize: '0.7rem',
                  background: formData.ip_reputation_score <= 0.30 ? 'var(--color-acid)' : 'transparent',
                  color: formData.ip_reputation_score <= 0.30 ? '#000' : 'var(--color-text-muted)',
                  border: formData.ip_reputation_score <= 0.30 ? 'none' : '1px solid var(--color-border)'
                }}
                onClick={() => setIpTier(0.25)}
              >
                Verified Trusted
              </button>

              <button
                type="button"
                className="forge-btn forge-btn--ghost"
                style={{
                  fontSize: '0.7rem',
                  background: formData.ip_reputation_score > 0.30 && formData.ip_reputation_score <= 0.55 ? 'var(--color-graphite)' : 'transparent',
                  color: formData.ip_reputation_score > 0.30 && formData.ip_reputation_score <= 0.55 ? 'var(--color-text)' : 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)'
                }}
                onClick={() => setIpTier(0.48)}
              >
                Neutral / ISP
              </button>

              <button
                type="button"
                className="forge-btn forge-btn--ghost"
                style={{
                  fontSize: '0.7rem',
                  background: formData.ip_reputation_score > 0.55 && formData.ip_reputation_score <= 0.80 ? 'var(--color-cobalt)' : 'transparent',
                  color: formData.ip_reputation_score > 0.55 && formData.ip_reputation_score <= 0.80 ? '#fff' : 'var(--color-text-muted)',
                  border: formData.ip_reputation_score > 0.55 && formData.ip_reputation_score <= 0.80 ? 'none' : '1px solid var(--color-border)'
                }}
                onClick={() => setIpTier(0.75)}
              >
                Suspicious Proxy
              </button>

              <button
                type="button"
                className="forge-btn forge-btn--ghost"
                style={{
                  fontSize: '0.7rem',
                  background: formData.ip_reputation_score > 0.80 ? 'var(--color-signal)' : 'transparent',
                  color: formData.ip_reputation_score > 0.80 ? '#fff' : 'var(--color-text-muted)',
                  border: formData.ip_reputation_score > 0.80 ? 'none' : '1px solid var(--color-border)'
                }}
                onClick={() => setIpTier(0.92)}
              >
                Known Malicious
              </button>
            </div>

            {/* Continuous Fine-Tune Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                <span>Zero Threat</span>
                <span className={`forge-spec__status ${currentTier.class}`}>{currentTier.label}</span>
                <span>Max Risk</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={formData.ip_reputation_score}
                onChange={(e) => setFormData({ ...formData, ip_reputation_score: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-accent)', marginTop: '8px' }}
              />
              <span className="forge-field__hint" style={{ marginTop: '4px' }}>Higher scores indicate the IP is present on malicious blacklists or VPN/proxy lists.</span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1.5rem 0' }} />

          {/* ================================================================= */}
          {/* PRIMARY USER-FRIENDLY CONTROLS: LOGIN ATTEMPTS & FAILED LOGINS */}
          {/* ================================================================= */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '0.25rem' }}>
            
            {/* Login Attempts */}
            <div className="forge-field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="forge-field__label">Login Attempts</label>
                  <span className="forge-spec__tag">{formData.login_attempts}</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={formData.login_attempts}
                onChange={(e) => setFormData({ ...formData, login_attempts: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-text)' }}
              />
              <span className="forge-field__hint">Normal users: 1 - 3 attempts</span>
            </div>

            {/* Failed Logins */}
            <div className="forge-field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="forge-field__label">Failed Logins</label>
                  <span className="forge-spec__tag forge-spec__tag--signal">{formData.failed_logins}</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                value={formData.failed_logins}
                onChange={(e) => setFormData({ ...formData, failed_logins: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-signal)' }}
              />
              <span className="forge-field__hint">Consecutive failed passwords</span>
            </div>

          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1.5rem 0' }} />

          {/* ================================================================= */}
          {/* COLLAPSIBLE ADVANCED MACHINE LEARNING PARAMETERS */}
          {/* ================================================================= */}
          <div style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              className="forge-btn forge-btn--ghost"
              style={{ width: '100%', justifyContent: 'space-between' }}
              onClick={() => setShowAdvancedNetwork(!showAdvancedNetwork)}
            >
              <span>Advanced ML Parameters</span>
              {showAdvancedNetwork ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showAdvancedNetwork && (
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--color-border)', borderTop: 'none', background: 'var(--color-slate)', borderRadius: '0 0 4px 4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {/* Encryption Standard */}
                  <div className="forge-field">
                    <label className="forge-field__label">Security / Encryption</label>
                    <select
                      className="forge-field__select"
                      value={formData.encryption_used}
                      onChange={(e) => setFormData({ ...formData, encryption_used: e.target.value })}
                    >
                      <option value="AES">AES (Secure Encrypted)</option>
                      <option value="DES">DES (Weak Legacy Crypto)</option>
                      <option value="None">None (Unencrypted Plaintext)</option>
                    </select>
                    <span className="forge-field__hint">AES is standard. None/DES flags legacy or script behavior.</span>
                  </div>

                  {/* Browser / Client */}
                  <div className="forge-field">
                    <label className="forge-field__label">Browser / Client Agent</label>
                    <select
                      className="forge-field__select"
                      value={formData.browser_type}
                      onChange={(e) => setFormData({ ...formData, browser_type: e.target.value })}
                    >
                      <option value="Chrome">Google Chrome</option>
                      <option value="Firefox">Mozilla Firefox</option>
                      <option value="Edge">Microsoft Edge</option>
                      <option value="Safari">Apple Safari</option>
                      <option value="Unknown">Unknown (Automated Script/Bot)</option>
                    </select>
                    <span className="forge-field__hint">Unknown typically indicates automated bot activity.</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div className="forge-field">
                    <label className="forge-field__label">Protocol</label>
                    <select
                      className="forge-field__select"
                      value={formData.protocol_type}
                      onChange={(e) => setFormData({ ...formData, protocol_type: e.target.value })}
                    >
                      <option value="TCP">TCP (Default)</option>
                      <option value="UDP">UDP (Datagram)</option>
                      <option value="ICMP">ICMP (Ping)</option>
                    </select>
                    <span className="forge-field__hint">TCP is standard web. UDP/ICMP often used in floods/scans.</span>
                  </div>

                  <div className="forge-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label className="forge-field__label">Packet Size</label>
                        <span className="forge-spec__tag">{formData.network_packet_size}B</span>
                    </div>
                    <input
                      type="range"
                      min="64"
                      max="1500"
                      value={formData.network_packet_size}
                      onChange={(e) => setFormData({ ...formData, network_packet_size: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: 'var(--color-text)' }}
                    />
                    <span className="forge-field__hint">Normal: ~450B. Large payloads indicate exfiltration.</span>
                  </div>

                  <div className="forge-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label className="forge-field__label">Duration</label>
                        <span className="forge-spec__tag">{formData.session_duration}s</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5000"
                      step="10"
                      value={formData.session_duration}
                      onChange={(e) => setFormData({ ...formData, session_duration: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: 'var(--color-text)' }}
                    />
                    <span className="forge-field__hint">Normal: &gt;100s. Short bursts imply automated attacks.</span>
                  </div>
                </div>

                <label className="forge-toggle">
                  <input
                    type="checkbox"
                    checked={formData.unusual_time_access === 1}
                    onChange={(e) => setFormData({ ...formData, unusual_time_access: e.target.checked ? 1 : 0 })}
                  />
                  Flag Off-Hours Operational Access
                </label>
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="forge-btn forge-btn--primary"
              style={{ flex: 1 }}
              onClick={() => runDiagnostic()}
            >
              <Zap size={14} /> RUN DIAGNOSTIC
            </button>
            <button
              type="button"
              className="forge-btn forge-btn--ghost"
              style={{ flex: 1 }}
              onClick={() => loadRandomSampleFromDataset()}
            >
              Random Dataset Sample
            </button>
          </div>
        </div>

      </article>

      {/* Right: Forge Diagnostic Verdict Card */}
      <article className="forge-spec">
        <header className="forge-spec__bar">
          <span className="forge-spec__id">02</span>
          <span className="forge-spec__title">ML DIAGNOSTIC VERDICT</span>
          <span className={`forge-spec__status ${diagnosticResult?.is_intrusion ? 'forge-spec__status--signal' : 'forge-spec__status--acid'}`}>
            {diagnosticResult?.is_intrusion ? 'ATTACK DETECTED' : 'LIVE'}
          </span>
        </header>

        <div className="forge-spec__body" style={{ display: 'flex', flexDirection: 'column' }}>
          {loading ? (
             <div className="forge-loader" role="status" aria-label="Loading" style={{ margin: 'auto' }}>
               <div className="forge-loader__bars">
                 <span className="forge-loader__bar"></span>
                 <span className="forge-loader__bar"></span>
                 <span className="forge-loader__bar"></span>
                 <span className="forge-loader__bar"></span>
                 <span className="forge-loader__bar"></span>
               </div>
               <span className="forge-loader__label">Analyzing · {formData.session_id}</span>
             </div>
          ) : diagnosticResult ? (
            <>
              {/* Verdict Header Banner */}
              <div
                style={{
                  border: `1px solid ${diagnosticResult.is_intrusion ? 'var(--color-signal)' : 'var(--color-acid)'}`,
                  borderRadius: '4px',
                  padding: '1.5rem 1.25rem',
                  background: 'var(--color-slate)',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '2rem',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color: diagnosticResult.is_intrusion ? 'var(--color-signal)' : 'var(--color-acid)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  {diagnosticResult.is_intrusion ? 'ATTACK DETECTED' : 'NO ATTACK DETECTED'}
                </div>
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                }}>
                  {diagnosticResult.is_intrusion ? 'INTRUSION BLOCKED — THREAT CONFIRMED' : 'LEGITIMATE TRAFFIC — SESSION AUTHORIZED'}
                </div>
                <div style={{
                  marginTop: '0.75rem',
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  background: 'var(--color-graphite)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '2px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                }}>
                  ML CONFIDENCE: {diagnosticResult.threat_percentage}%
                </div>
              </div>

              {/* Feature Attribution Drivers */}
              <div style={{ marginTop: '1.5rem' }}>
                <span className="forge-spec__eyebrow">TOP RISK FACTORS DETECTED</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {diagnosticResult.risk_factors.map((rf, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: '2px',
                        background: rf.level === 'danger' ? 'rgba(239, 68, 68, 0.1)' : rf.level === 'warning' ? 'var(--color-slate)' : 'var(--color-graphite)',
                        color: rf.level === 'danger' ? 'var(--color-signal)' : 'var(--color-text)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
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
                  background: 'rgba(246, 90, 26, 0.05)',
                  border: '1px solid var(--color-accent)',
                  borderRadius: '4px',
                  marginTop: '1.5rem'
                }}
              >
                <span className="forge-spec__eyebrow" style={{ color: 'var(--color-accent)' }}>
                  RECOMMENDED INCIDENT RESPONSE
                </span>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.25rem', color: 'var(--color-text)' }}>
                  {diagnosticResult.recommended_action}
                </p>
              </div>

              {/* Feature Vector Payload Inspection */}
              <div style={{ 
                background: 'var(--color-graphite)', 
                padding: '0.75rem', 
                border: '1px solid var(--color-border)', 
                borderRadius: '4px',
                fontSize: '0.75rem', 
                fontFamily: 'var(--font-mono)',
                marginTop: 'auto',
                color: 'var(--color-text-muted)'
              }}>
                <div><strong>CONFIGURED EVENT:</strong> IP_Score={formData.ip_reputation_score} | Fails={formData.failed_logins} | Attempts={formData.login_attempts} | Proto={formData.protocol_type} | Packet={formData.network_packet_size}B</div>
              </div>
            </>
          ) : null}
        </div>
      </article>
      
      </div>
    </div>
  );
}
