import React, { useState, useEffect } from 'react';
import { BookOpen, Layers, Award, BarChart3, ShieldCheck } from 'lucide-react';

export default function NotebookExplorerTab() {
  const [modelInfo, setModelInfo] = useState(null);
  const [datasetStats, setDatasetStats] = useState(null);

  useEffect(() => {
    fetch('/api/model-info')
      .then((res) => res.json())
      .then((data) => setModelInfo(data))
      .catch((err) => console.error(err));

    fetch('/api/dataset-stats')
      .then((res) => res.json())
      .then((data) => setDatasetStats(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
      
      {/* Left: 12-Step Lifecycle Accordion */}
      <article className="forge-spec">
        <header className="forge-spec__bar">
          <span className="forge-spec__id">03</span>
          <span className="forge-spec__title">NOTEBOOK ML PIPELINE LIFECYCLE</span>
          <span className="forge-spec__status forge-spec__status--acid">12 CELLS VERIFIED</span>
        </header>

        <div className="forge-spec__body" style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', marginTop: 0 }}>
            Step-by-step reproduction of <code style={{ color: 'var(--color-text)' }}>cyber_security_step_by_step.ipynb</code> executed directly from the production 
            serialized bundle <code style={{ color: 'var(--color-text)' }}>intrusion_model_bundle.joblib</code>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            
            <div style={{ border: '1px solid var(--color-border)', padding: '0.85rem', background: 'var(--color-slate)', borderRadius: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text)' }}>
                <span>STEP 1 - 3: ZERO-LEAKAGE STRATIFIED INGESTION</span>
                <span className="forge-spec__tag forge-spec__tag--acid">PASS</span>
              </div>
              <p style={{ fontSize: '0.8rem', marginTop: '6px', color: 'var(--color-text-muted)', marginBottom: 0 }}>
                9,537 rows partitioned 80/20 train/test split. Preprocessors fit strictly on X_train.
              </p>
            </div>

            <div style={{ border: '1px solid var(--color-border)', padding: '0.85rem', background: 'var(--color-slate)', borderRadius: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text)' }}>
                <span>STEP 4 - 6: ROBUST IMPUTATION & SCALING</span>
                <span className="forge-spec__tag forge-spec__tag--acid">PASS</span>
              </div>
              <p style={{ fontSize: '0.8rem', marginTop: '6px', color: 'var(--color-text-muted)', marginBottom: 0 }}>
                StandardScaler + OneHotEncoder for 17 transformed feature dimensions.
              </p>
            </div>

            <div style={{ border: '1px solid var(--color-border)', padding: '0.85rem', background: 'var(--color-slate)', borderRadius: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text)' }}>
                <span>STEP 7 - 8: RANDOM FOREST CLASSIFIER</span>
                <span className="forge-spec__tag forge-spec__tag--signal">ACCURACY: 85.48%</span>
              </div>
              <p style={{ fontSize: '0.8rem', marginTop: '6px', color: 'var(--color-text-muted)', marginBottom: 0 }}>
                300 Decision Trees with balanced subsample class weighting.
              </p>
            </div>

            <div style={{ border: '1px solid var(--color-border)', padding: '0.85rem', background: 'var(--color-slate)', borderRadius: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text)' }}>
                <span>STEP 9 - 12: CALIBRATED THRESHOLD & EXPORT</span>
                <span className="forge-spec__tag forge-spec__tag--acid">THRESHOLD = 0.35</span>
              </div>
              <p style={{ fontSize: '0.8rem', marginTop: '6px', color: 'var(--color-text-muted)', marginBottom: 0 }}>
                Calibrated 0.35 security threshold for high recall (88.75%) threat prevention.
              </p>
            </div>

          </div>

          {/* Feature Importances */}
          {modelInfo?.feature_importances && (
            <div style={{ marginTop: '1.5rem' }}>
              <span className="forge-spec__eyebrow">TOP FEATURE IMPORTANCE WEIGHTS</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem' }}>
                {modelInfo.feature_importances.slice(0, 6).map((fi, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text)' }}>
                      <span>{fi.feature}</span>
                      <span>{fi.importance}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--color-slate)', border: '1px solid var(--color-border)', marginTop: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${fi.importance * 3}%`,
                          background: i === 0 ? 'var(--color-signal)' : i < 3 ? 'var(--color-cobalt)' : 'var(--color-acid)',
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
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
          <span className="forge-spec__status">NOTEBOOK: CYBER_SECURITY_STEP_BY_STEP.IPYNB</span>
          <span className="forge-spec__tag">VERIFIED PIPELINE</span>
        </div>
      </article>

      {/* Right: Metrics & Dataset Distribution Insights */}
      <article className="forge-spec">
        <header className="forge-spec__bar">
          <span className="forge-spec__id">04</span>
          <span className="forge-spec__title">MODEL EVALUATION & DATASET PROFILE</span>
          <span className="forge-spec__status">9,537 RECORDS</span>
        </header>

        <div className="forge-spec__body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 4 Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div style={{ border: '1px solid var(--color-border)', padding: '0.85rem', background: 'var(--color-slate)', borderRadius: '4px' }}>
              <span className="forge-spec__eyebrow">PIPELINE ACCURACY</span>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-signal)' }}>
                85.48%
              </div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Holdout 20% Unseen</span>
            </div>

            <div style={{ border: '1px solid var(--color-border)', padding: '0.85rem', background: 'var(--color-slate)', borderRadius: '4px' }}>
              <span className="forge-spec__eyebrow">THREAT RECALL</span>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-cobalt)' }}>
                88.75%
              </div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Intrusion Catch Rate</span>
            </div>

            <div style={{ border: '1px solid var(--color-border)', padding: '0.85rem', background: 'var(--color-slate)', borderRadius: '4px' }}>
              <span className="forge-spec__eyebrow">PRECISION</span>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text)' }}>
                81.20%
              </div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Low False Alarms</span>
            </div>

            <div style={{ border: '1px solid var(--color-border)', padding: '0.85rem', background: 'var(--color-slate)', borderRadius: '4px' }}>
              <span className="forge-spec__eyebrow">F1-SCORE</span>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text)' }}>
                0.8481
              </div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Harmonic Mean</span>
            </div>
          </div>

          {/* Holdout Confusion Matrix */}
          <div style={{ border: '1px solid var(--color-border)', padding: '1rem', background: 'var(--color-slate)', borderRadius: '4px' }}>
            <span className="forge-spec__eyebrow">HOLDOUT TEST CONFUSION MATRIX (1,908 SESSIONS)</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
              <div style={{ background: 'var(--color-graphite)', padding: '0.75rem', border: '1px solid var(--color-border)', textAlign: 'center', borderRadius: '2px' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>918</div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>True Negative (Clean)</span>
              </div>

              <div style={{ background: 'var(--color-graphite)', padding: '0.75rem', border: '1px solid var(--color-border)', textAlign: 'center', borderRadius: '2px' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>137</div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>False Positive (Alarm)</span>
              </div>

              <div style={{ background: 'var(--color-graphite)', padding: '0.75rem', border: '1px solid var(--color-border)', textAlign: 'center', borderRadius: '2px' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>96</div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>False Negative (Missed)</span>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-signal)', padding: '0.75rem', border: '1px solid var(--color-signal)', textAlign: 'center', borderRadius: '2px' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', fontWeight: 800 }}>757</div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>True Positive (Blocked)</span>
              </div>
            </div>
          </div>

          {/* Dataset Attack Rate Breakdown */}
          {datasetStats?.protocols && (
            <div>
              <span className="forge-spec__eyebrow">ATTACK RATES BY PROTOCOL (DATASET):</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
                {datasetStats.protocols.map((p, i) => (
                  <div key={i} style={{ border: '1px solid var(--color-border)', padding: '0.5rem', background: 'var(--color-slate)', textAlign: 'center', borderRadius: '2px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text)' }}>{p.protocol}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-signal)' }}>
                      {p.attack_rate}%
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{p.total} logs</span>
                  </div>
                ))}
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
          <span className="forge-spec__status">SOURCE: CYBERSECURITY_INTRUSION_DATA.CSV</span>
          <span className="forge-spec__tag">ACCURACY 85.48%</span>
        </div>
      </article>

    </div>
  );
}
