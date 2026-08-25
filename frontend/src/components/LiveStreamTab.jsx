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
      
      {/* Left Broadside Card: Live Diagnostics & Gauge */}
      <div className="broadside-card broadside-card--offset">
        <header className="broadside-card__header broadside-card__header--dark">
          <span>REAL-TIME PACKET TELEMETRY</span>
          <span className="broadside-card__tag broadside-card__tag--signal">
            {isPlaying ? 'STREAMING ACTIVE' : 'PAUSED'}
          </span>
        </header>

        <div className="broadside-card__body">
          {/* Controls row */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className={`broadside-btn ${isPlaying ? 'broadside-btn--primary' : 'broadside-btn--acid'}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause Stream' : 'Resume Feed'}
            </button>

            <button
              type="button"
              className="broadside-btn broadside-btn--ghost"
              onClick={handleStepOnce}
            >
              <FastForward size={16} /> Step 1
            </button>

            <button
              type="button"
              className="broadside-btn broadside-btn--ghost"
              onClick={handleClearHistory}
            >
              <Trash2 size={16} /> Clear
            </button>
          </div>

          {/* Speed Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span className="broadside-field__label" style={{ margin: 0 }}>SPEED:</span>
            {[
              { label: '1.5s Normal', val: 1500 },
              { label: '0.8s Fast', val: 800 },
              { label: '0.3s Burst', val: 300 },
            ].map((sp) => (
              <button
                key={sp.val}
                type="button"
                onClick={() => setStreamSpeed(sp.val)}
                className={`broadside-btn broadside-btn--ghost`}
                style={{
                  padding: '0.4rem 0.65rem',
                  minHeight: '32px',
                  fontSize: '0.75rem',
                  background: streamSpeed === sp.val ? 'var(--color-ink)' : 'var(--color-stock)',
                  color: streamSpeed === sp.val ? 'var(--color-acid)' : 'var(--color-ink)',
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
                border: 'var(--rule) solid var(--color-ink)',
                padding: '1.25rem',
                background: currentEvent.is_intrusion ? 'var(--color-signal)' : 'var(--color-acid)',
                color: currentEvent.is_intrusion ? 'var(--color-on-signal)' : 'var(--color-ink)',
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  EVALUATED INTRUSION PROBABILITY
                </span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>
                  {currentEvent.threat_percentage}%
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.35rem 0.75rem',
                    background: 'var(--color-ink)',
                    color: currentEvent.is_intrusion ? 'var(--color-signal)' : 'var(--color-acid)',
                    fontWeight: 900,
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.85rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {currentEvent.is_intrusion ? '🚨 THREAT BLOCKED' : '🟩 CLEAN NORMAL'}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--color-stock)', border: 'var(--rule) solid var(--color-ink)' }}>
              Awaiting stream packet ingestion...
            </div>
          )}

          {/* Evaluated Packet Metadata */}
          {currentEvent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                  background: 'var(--color-stock)',
                  padding: '0.75rem',
                  border: 'var(--rule) solid var(--color-ink)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                }}
              >
                <div><strong>SESSION:</strong> {currentEvent.session_id}</div>
                <div><strong>PROTO:</strong> {currentEvent.input_features.protocol_type}</div>
                <div><strong>SIZE:</strong> {currentEvent.input_features.network_packet_size} B</div>
                <div><strong>FAILS:</strong> {currentEvent.input_features.failed_logins}</div>
                <div><strong>IP REP:</strong> {currentEvent.input_features.ip_reputation_score}</div>
                <div><strong>ENCR:</strong> {currentEvent.input_features.encryption_used}</div>
                <div><strong>DURATION:</strong> {currentEvent.input_features.session_duration}s</div>
                <div><strong>OFF-HOURS:</strong> {currentEvent.input_features.unusual_time_access ? 'YES (1)' : 'NO (0)'}</div>
              </div>

              {/* Contributing Threat Drivers */}
              <div>
                <span className="broadside-field__label">THREAT DRIVERS & FEATURE WEIGHTS:</span>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '4px' }}>
                  {currentEvent.risk_factors.map((rf, idx) => (
                    <span
                      key={idx}
                      className="broadside-pill"
                      style={{
                        background: rf.level === 'danger' ? 'var(--color-signal)' : rf.level === 'warning' ? 'var(--color-cobalt)' : 'var(--color-bone)',
                        color: rf.level === 'safe' ? 'var(--color-ink)' : '#fff',
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
                  background: 'var(--color-bone)',
                  border: 'var(--rule) solid var(--color-ink)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <strong>INCIDENT RESPONSE:</strong> {currentEvent.recommended_action}
              </div>
            </div>
          )}
        </div>

        <footer className="broadside-card__footer">
          <span className="broadside-card__meta">TOTAL BUFFERED: {totalStreamed} SESSIONS</span>
          <span className="broadside-card__tag">9,537 CSV SAMPLES</span>
        </footer>
      </div>

      {/* Right Broadside Card: Real-Time Stream Table */}
      <div className="broadside-card broadside-card--offset">
        <header className="broadside-card__header broadside-card__header--acid">
          <span>INCOMING LIVE LOG STREAM</span>
          <span className="broadside-card__meta">{eventHistory.length} Buffered Events</span>
        </header>

        <div className="broadside-card__body" style={{ padding: 0 }}>
          <div className="broadside-table-wrap" style={{ maxHeight: '520px', border: 'none' }}>
            <table className="broadside-table">
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
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      Streaming logs will appear here in real-time.
                    </td>
                  </tr>
                ) : (
                  eventHistory.map((ev, i) => (
                    <tr key={`${ev.session_id}-${i}`}>
                      <td style={{ fontWeight: 700 }}>{ev.session_id}</td>
                      <td>{ev.input_features.protocol_type}</td>
                      <td>{ev.input_features.network_packet_size}B</td>
                      <td>{ev.input_features.failed_logins}</td>
                      <td>{ev.input_features.ip_reputation_score}</td>
                      <td style={{ fontWeight: 800 }}>{ev.threat_percentage}%</td>
                      <td>
                        <span
                          className={`broadside-pill ${
                            ev.is_intrusion ? 'broadside-pill--signal' : 'broadside-pill--acid'
                          }`}
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

        <footer className="broadside-card__footer">
          <span className="broadside-card__meta">EVALUATED BY RANDOMFOREST BUNDLE</span>
          <button type="button" className="broadside-card__action" onClick={handleClearHistory}>
            Flush Buffer
          </button>
        </footer>
      </div>

    </div>
  );
}
