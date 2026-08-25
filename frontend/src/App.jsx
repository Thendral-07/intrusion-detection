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
            <h1>BROADSIDE // IDS TELEMETRY</h1>
            <div className="masthead-sub">
              Machine Learning Intrusion Detection System & Security Operations Console
            </div>
          </div>

          <div className="masthead-telemetry">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
              }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {/* Global Threshold Tuner */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '180px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="telemetry-item__lbl">DECISION THRESHOLD:</span>
                <span className="broadside-field__val-tag">{globalThreshold}</span>
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
              <span className="telemetry-item__val" style={{ color: 'var(--color-ink)' }}>85.48%</span>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-item__lbl">INFERENCE ENGINE</span>
              <span className="telemetry-item__val" style={{ color: 'var(--color-cobalt)' }}>FASTAPI</span>
            </div>

          </div>
        </div>
      </header>

      {/* Broadside Navigation Tabs */}
      <nav className="broadside-nav">
        <button
          type="button"
          className={`broadside-tab ${activeTab === 'inspector' ? 'active' : ''}`}
          onClick={() => setActiveTab('inspector')}
        >
          <Sliders size={16} />
          <span>Single Packet Inspector & Scenarios</span>
        </button>

        <button
          type="button"
          className={`broadside-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <Layers size={16} />
          <span>Notebook Step-by-Step Explorer & Metrics</span>
        </button>
      </nav>

      {/* Active Tab View */}
      <main>
        {activeTab === 'inspector' && <InspectorTab globalThreshold={globalThreshold} />}
        {activeTab === 'analytics' && <NotebookExplorerTab />}
      </main>

      {/* Broadside Footer */}
      <footer
        style={{
          border: 'var(--rule) solid var(--color-ink)',
          background: 'var(--color-stock)',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        <div>
          BROADSIDE DESIGN SYSTEM // INSPIRED BY UIVERSE.IO // ZERO RADIUS HARD RULES
        </div>
        <div>
          TRAINED EXCLUSIVELY ON <code>cybersecurity_intrusion_data.csv</code> & <code>cyber_security_step_by_step.ipynb</code>
        </div>
      </footer>

    </div>
  );
}
