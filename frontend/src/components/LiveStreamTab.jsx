import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, FastForward, Trash2, ShieldAlert, ShieldCheck, Activity, Cpu } from 'lucide-react';

export default function LiveStreamTab({ globalThreshold }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [streamSpeed, setStreamSpeed] = useState(1000); // ms
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);
  const [totalStreamed, setTotalStreamed] = useState(0);
  const timerRef = useRef(null);

  const fetchStreamSample = async () => {
    try {
      const res = await fetch(`/api/stream-feed?count=1&threshold=${globalThreshold}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.events && data.events.length > 0) {
        const ev = data.events[0];
        setCurrentEvent(ev);
        setEventHistory((prev) => [ev, ...prev].slice(0, 50));
        setTotalStreamed((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error fetching stream:', err);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      fetchStreamSample();
      timerRef.current = setInterval(fetchStreamSample, streamSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, streamSpeed, globalThreshold]);

  const handleStepOnce = () => {
    setIsPlaying(false);
    fetchStreamSample();
  };

  const handleClearHistory = () => {
    setEventHistory([]);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
      
      {/* Left Forge Card: Live Diagnostics & Gauge */}
      <article className="forge-spec">
        <header className="forge-spec__bar">
          <span className="forge-spec__id">05</span>
          <span className="forge-spec__title">REAL-TIME PACKET TELEMETRY</span>
          <span className={`forge-spec__status ${isPlaying ? 'forge-spec__status--signal' : ''}`}>
            {isPlaying ? 'STREAMING ACTIVE' : 'PAUSED'}
          </span>
        </header>

        <div className="forge-spec__body" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Controls row */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className={`forge-btn ${isPlaying ? 'forge-btn--primary' : 'forge-btn--ghost'}`}
              style={!isPlaying ? { border: '1px solid var(--color-border)' } : {}}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              {isPlaying ? 'Pause Stream' : 'Resume Feed'}
            </button>

            <button
              type="button"
              className="forge-btn forge-btn--ghost"
              style={{ border: '1px solid var(--color-border)' }}
              onClick={handleStepOnce}
            >
              <FastForward size={14} /> Step 1
            </button>

            <button
              type="button"
              className="forge-btn forge-btn--ghost"
              style={{ border: '1px solid var(--color-border)' }}
              onClick={handleClearHistory}
            >
              <Trash2 size={14} /> Clear
            </button>
          </div>

          {/* Speed Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <span className="forge-spec__eyebrow" style={{ margin: 0 }}>SPEED:</span>
            {[
              { label: '1.5s Normal', val: 1500 },
              { label: '0.8s Fast', val: 800 },
              { label: '0.3s Burst', val: 300 },
            ].map((sp) => (
              <button
                key={sp.val}
                type="button"
                onClick={() => setStreamSpeed(sp.val)}
                className="forge-btn forge-btn--ghost"
                style={{
                  padding: '0.4rem 0.65rem',
                  minHeight: '32px',
                  fontSize: '0.75rem',
                  background: streamSpeed === sp.val ? 'var(--color-slate)' : 'transparent',
                  color: streamSpeed === sp.val ? 'var(--color-text)' : 'var(--color-text-muted)',
                  border: streamSpeed === sp.val ? '1px solid var(--color-border-strong)' : '1px solid transparent',
                }}
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Threat Metric Big Banner */}
          {currentEvent ? (
            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                padding: '1.25rem',
                background: currentEvent.is_intrusion ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                borderColor: currentEvent.is_intrusion ? 'var(--color-signal)' : 'var(--color-acid)',
                color: currentEvent.is_intrusion ? 'var(--color-signal)' : 'var(--color-acid)',
                marginTop: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                  EVALUATED INTRUSION PROBABILITY
                </span>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>
                  {currentEvent.threat_percentage}%
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.35rem 0.75rem',
                    background: currentEvent.is_intrusion ? 'var(--color-signal)' : 'var(--color-acid)',
                    color: '#fff',
                    borderRadius: '2px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.85rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {currentEvent.is_intrusion ? 'THREAT BLOCKED' : 'CLEAN NORMAL'}
                </span>
              </div>
            </div>
          ) : (
             <div className="forge-loader" role="status" aria-label="Loading" style={{ margin: '3rem auto' }}>
               <div className="forge-loader__bars">
                 <span className="forge-loader__bar"></span>
                 <span className="forge-loader__bar"></span>
                 <span className="forge-loader__bar"></span>
                 <span className="forge-loader__bar"></span>
                 <span className="forge-loader__bar"></span>
               </div>
               <span className="forge-loader__label">Awaiting Stream Packet...</span>
             </div>
          )}

          {/* Evaluated Packet Metadata */}
          {currentEvent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                  background: 'var(--color-slate)',
                  padding: '1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)'
                }}
              >
                <div><strong style={{ color: 'var(--color-text)' }}>SESSION:</strong> {currentEvent.session_id}</div>
                <div><strong style={{ color: 'var(--color-text)' }}>PROTO:</strong> {currentEvent.input_features.protocol_type}</div>
                <div><strong style={{ color: 'var(--color-text)' }}>SIZE:</strong> {currentEvent.input_features.network_packet_size} B</div>
                <div><strong style={{ color: 'var(--color-text)' }}>FAILS:</strong> {currentEvent.input_features.failed_logins}</div>
                <div><strong style={{ color: 'var(--color-text)' }}>IP REP:</strong> {currentEvent.input_features.ip_reputation_score}</div>
                <div><strong style={{ color: 'var(--color-text)' }}>ENCR:</strong> {currentEvent.input_features.encryption_used}</div>
                <div><strong style={{ color: 'var(--color-text)' }}>DURATION:</strong> {currentEvent.input_features.session_duration}s</div>
                <div><strong style={{ color: 'var(--color-text)' }}>OFF-HOURS:</strong> {currentEvent.input_features.unusual_time_access ? 'YES (1)' : 'NO (0)'}</div>
              </div>

              {/* Contributing Threat Drivers */}
              <div style={{ marginTop: '0.75rem' }}>
                <span className="forge-spec__eyebrow">THREAT DRIVERS & FEATURE WEIGHTS</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {currentEvent.risk_factors.map((rf, idx) => (
                    <span
                      key={idx}
                      className="forge-spec__tag"
                      style={{
                        background: rf.level === 'danger' ? 'rgba(239, 68, 68, 0.1)' : rf.level === 'warning' ? 'var(--color-slate)' : 'transparent',
                        borderColor: rf.level === 'danger' ? 'var(--color-signal)' : 'var(--color-border)',
                        color: rf.level === 'danger' ? 'var(--color-signal)' : 'var(--color-text-muted)',
                      }}
                    >
                      {rf.factor} ({rf.weight})
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Action */}
              <div
                style={{
                  padding: '0.75rem',
                  background: 'rgba(246, 90, 26, 0.05)',
                  border: '1px solid var(--color-accent)',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  color: 'var(--color-text)',
                  marginTop: '0.75rem'
                }}
              >
                <strong style={{ color: 'var(--color-accent)' }}>INCIDENT RESPONSE:</strong> {currentEvent.recommended_action}
              </div>
            </div>
          )}
        </div>

        <div style={{ 
          borderTop: '1px solid var(--color-border)', 
          background: 'var(--color-slate)', 
          padding: '0.75rem 1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span className="forge-spec__status">TOTAL BUFFERED: {totalStreamed} SESSIONS</span>
          <span className="forge-spec__tag">9,537 CSV SAMPLES</span>
        </div>
      </article>

      {/* Right Forge Card: Real-Time Stream Table */}
      <article className="forge-spec">
        <header className="forge-spec__bar">
          <span className="forge-spec__id">06</span>
          <span className="forge-spec__title">INCOMING LIVE LOG STREAM</span>
          <span className="forge-spec__status">{eventHistory.length} Buffered Events</span>
        </header>

        <div className="forge-spec__body" style={{ padding: 0 }}>
          <div className="forge-table-wrap" style={{ maxHeight: '600px', border: 'none', borderRadius: 0, background: 'transparent' }}>
            <table className="forge-table">
              <thead>
                <tr>
                  <th>SESSION ID</th>
                  <th>PROTO</th>
                  <th>SIZE</th>
                  <th>FAILED</th>
                  <th>IP REP</th>
                  <th>THREAT %</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {eventHistory.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                      Streaming logs will appear here in real-time.
                    </td>
                  </tr>
                ) : (
                  eventHistory.map((ev, i) => (
                    <tr key={`${ev.session_id}-${i}`}>
                      <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{ev.session_id}</td>
                      <td>{ev.input_features.protocol_type}</td>
                      <td>{ev.input_features.network_packet_size}B</td>
                      <td>{ev.input_features.failed_logins}</td>
                      <td>{ev.input_features.ip_reputation_score}</td>
                      <td style={{ fontWeight: 800, color: ev.is_intrusion ? 'var(--color-signal)' : 'var(--color-text)' }}>{ev.threat_percentage}%</td>
                      <td>
                        <span
                          className={`forge-spec__tag ${
                            ev.is_intrusion ? 'forge-spec__tag--signal' : 'forge-spec__tag--acid'
                          }`}
                          style={{ background: ev.is_intrusion ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}
                        >
                          {ev.is_intrusion ? 'BLOCKED' : 'ALLOW'}
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
          <span className="forge-spec__status">EVALUATED BY RANDOMFOREST BUNDLE</span>
          <button type="button" className="forge-btn forge-btn--ghost" style={{ padding: '0 8px', height: '24px', fontSize: '11px' }} onClick={handleClearHistory}>
            Flush Buffer
          </button>
        </div>
      </article>

    </div>
  );
}
