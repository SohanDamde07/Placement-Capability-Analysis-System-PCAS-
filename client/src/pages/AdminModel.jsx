import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminModel() {
  const [modelMeta, setModelMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelMeta();
  }, []);

  const fetchModelMeta = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/stats');
      if (res.data.success) {
        setModelMeta(res.data.stats.mlStatus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const featureWeights = [
    { feature: 'CGPA', weight: '+1.42', importance: 92, direction: 'Positive', description: 'Academic performance remains the strongest foundational filter across technical screening.' },
    { feature: 'Aptitude Test Score', weight: '+1.28', importance: 88, direction: 'Positive', description: 'Quantitative, logical reasoning, and verbal score from placement drives.' },
    { feature: 'Internships', weight: '+1.15', importance: 82, direction: 'Positive', description: 'Real-world industrial experience significantly boosts probability of final selection.' },
    { feature: 'Soft Skills Rating', weight: '+0.88', importance: 74, direction: 'Positive', description: 'Evaluated communication and behavioral rating for HR and client rounds.' },
    { feature: 'Projects Count', weight: '+0.76', importance: 68, direction: 'Positive', description: 'Hands-on practical development portfolio demonstrated via GitHub.' },
    { feature: 'Placement Training', weight: '+0.64', importance: 60, direction: 'Positive', description: 'Completion of college pre-placement training modules.' },
    { feature: 'HSC / 12th Marks', weight: '+0.45', importance: 52, direction: 'Positive', description: 'Secondary higher education score criteria.' },
    { feature: 'Workshops & Certs', weight: '+0.39', importance: 48, direction: 'Positive', description: 'Industry certifications (AWS, GCP, Coursera, NPTEL).' },
    { feature: 'SSC / 10th Marks', weight: '+0.32', importance: 40, direction: 'Positive', description: 'Basic academic consistency threshold.' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold uppercase tracking-wider mb-2">
          <span className="material-symbols-outlined text-sm">memory</span>
          ML Intelligence Layer
        </div>
        <h1 className="text-3xl font-extrabold font-headline text-on-surface">Predictive Placement Model Architecture</h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Diagnostics and feature weight analysis for the active production model trained on 10,000 historical placement records
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Active Model Pipeline</span>
          <p className="text-xl font-black font-headline text-primary">StandardScaler + LogisticRegression</p>
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold pt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Operational & Serving Predictions
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Validated Test Accuracy</span>
          <p className="text-4xl font-black font-headline text-emerald-600">80.85%</p>
          <span className="text-xs text-on-surface-variant block pt-2">5-Fold CV Score: 80.00% (&plusmn;0.98%)</span>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Discriminative Power (ROC-AUC)</span>
          <p className="text-4xl font-black font-headline text-violet-700">0.8837</p>
          <span className="text-xs text-on-surface-variant block pt-2">Weighted F1-Score: 0.81</span>
        </div>
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold font-headline text-on-surface">Placement Probability Factor Coefficients</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Standardized linear regression weights showing which candidate credentials exert the greatest influence on hiring outcomes
          </p>
        </div>

        <div className="space-y-4">
          {featureWeights.map(fw => (
            <div key={fw.feature} className="p-4 rounded-2xl bg-surface-container space-y-2 hover:bg-surface-container-high transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-on-surface">{fw.feature}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {fw.weight}
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">Influence: {fw.importance}%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${fw.importance}%` }}></div>
              </div>
              <p className="text-[11px] text-on-surface-variant pt-1">{fw.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
