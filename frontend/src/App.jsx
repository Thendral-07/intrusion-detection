import React, { useState, useEffect } from 'react';
import { Shield, Sliders, Layers, Moon, Sun } from 'lucide-react';
import InspectorTab from './components/InspectorTab.jsx';
import NotebookExplorerTab from './components/NotebookExplorerTab.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('inspector'); // inspector, batch, analytics
  const [globalThreshold, setGlobalThreshold] = useState(0.35);
  const [systemHealth, setSystemHealth] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setSystemHealth(data))
      .catch((err) => console.error('Health check failed:', err));
  }, []);

  return (
    <div className="broadside-app">
      
      {/* Top Broadside Editorial Masthead */}
      <header className="broadside-masthead">
        <div className="masthead-top">
          <span>ISSUE NO. 042 // CYBERSECURITY SOC DEFENSE EDITION</span>
          <span>STATUS: <span style={{ color: 'var(--color-signal)', fontWeight: 800 }}>ARMED & ACTIVE</span></span>
        </div>

        <div className="masthead-main">
          <div className="masthead-brand">
            <h1>CYBERSOC // THREAT MATRIX</h1>
            <div className="masthead-sub">
              Machine Learning Intrusion Detection System & Security Operations Console
            </div>
          </div>

          <div className="masthead-telemetry">
            <button
              className="forge-btn forge-btn--ghost"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={{ padding: '0 8px', color: 'var(--color-text)' }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {/* Global Threshold Tuner */}
            <div className="forge-field" style={{ minWidth: '180px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="forge-field__label" style={{ marginBottom: 0 }}>DECISION THRESHOLD:</span>
                <span className="forge-spec__tag">{globalThreshold}</span>
              </div>
              <input
                type="range"
                className="broadside-slider"
                min="0.05"
                max="0.95"
                step="0.05"
                value={globalThreshold}
                onChange={(e) => setGlobalThreshold(Number(e.target.value))}
              />
            </div>

            <div className="telemetry-item">
              <span className="telemetry-item__lbl">PIPELINE ACCURACY</span>
              <span className="telemetry-item__val" style={{ color: 'var(--color-accent)' }}>85.48%</span>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-item__lbl">INFERENCE ENGINE</span>
              <span className="telemetry-item__val" style={{ color: 'var(--color-cobalt)' }}>FASTAPI</span>
            </div>

          </div>
        </div>
      </header>

      {/* Forge Navigation Tabs */}
      <div className="forge-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={`forge-tabs__tab ${activeTab === 'inspector' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('inspector')}
        >
          <span className="forge-tabs__num">01</span>
          Inspector
        </button>

        <button
          type="button"
          role="tab"
          className={`forge-tabs__tab ${activeTab === 'analytics' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="forge-tabs__num">02</span>
          Analytics
        </button>
      </div>

      {/* Active Tab View */}
      <main>
        {activeTab === 'inspector' && <InspectorTab globalThreshold={globalThreshold} />}
        {activeTab === 'analytics' && <NotebookExplorerTab />}
      </main>

      {/* Forge Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          background: 'transparent',
          marginTop: '3rem',
          padding: '1.5rem 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--color-text-muted)'
        }}
      >
        <div>
          FORGE DESIGN SYSTEM // CYBERPUNK DEVELOPER AESTHETIC
        </div>
        <div>
          TRAINED EXCLUSIVELY ON <code>cybersecurity_intrusion_data.csv</code> & <code>cyber_security_step_by_step.ipynb</code>
        </div>
      </footer>

    </div>
  );
}
