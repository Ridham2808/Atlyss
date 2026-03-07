import React, { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import api from '../../utils/api';
import { ChevronDownIcon, ChevronRightIcon, ScaleIcon } from '@heroicons/react/24/outline';

const T = {
    bg: '#080808', card: '#101010',
    border: '#1a1a1a', borderMid: '#252525',
    hi: '#efefef', text: '#c8c8c8', muted: '#484848', faint: '#1c1c1c',
    acc: '#f1642a', accDim: 'rgba(241,100,42,0.09)', accBorder: 'rgba(241,100,42,0.22)',
    amber: '#d09830',
    mono: "'Space Mono', monospace",
    disp: "'Bebas Neue', sans-serif",
};

function FmtDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const METRIC_GROUPS = [
    { g: 'Basic', rows: [['Weight', 'weight', 'kg'], ['Height', 'height', 'cm']] },
    {
        g: 'Body Circumference', rows: [
            ['Neck', 'neck', 'cm'], ['Shoulder', 'shoulder', 'cm'], ['Chest', 'chest', 'cm'],
            ['Upper Arm', 'upperArm', 'cm'], ['Forearm', 'forearm', 'cm'], ['Wrist', 'wrist', 'cm'],
            ['Upper Abdomen', 'upperAbdomen', 'cm'], ['Waist', 'waist', 'cm'],
            ['Lower Abdomen', 'lowerAbdomen', 'cm'], ['Hips', 'hips', 'cm'],
            ['Thigh', 'thigh', 'cm'], ['Calf', 'calf', 'cm'], ['Ankle', 'ankle', 'cm'],
        ]
    },
    {
        g: 'BCA Report', rows: [
            ['Body Fat (B.F)', 'bodyFat', '%'],
            ['Visceral Fat (V.F)', 'visceralFat', ''],
            ['Resting Metabolism (R.M)', 'restingMetabolism', 'kcal'],
            ['BMI (B.M.I)', 'bmi', ''],
            ['Biological Age (B.A)', 'biologicalAge', 'yrs'],
        ]
    },
];

function RecordCard({ rec }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ background: T.card, border: `1px solid ${T.borderMid}`, borderRadius: 10, overflow: 'hidden' }}>
            <div onClick={() => setOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer' }}>
                {open ? <ChevronDownIcon style={{ width: 14, color: T.acc }} /> : <ChevronRightIcon style={{ width: 14, color: T.muted }} />}
                <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: T.mono, fontSize: '0.72rem', fontWeight: 700, color: T.hi }}>{FmtDate(rec.measuredAt)}</div>
                    <div style={{ fontFamily: T.mono, fontSize: '0.58rem', color: T.muted, marginTop: 2 }}>
                        {[
                            rec.weight && `${rec.weight} kg`,
                            rec.bmi && `BMI ${rec.bmi}`,
                            rec.bodyFat && `B.F ${rec.bodyFat}%`,
                        ].filter(Boolean).join(' · ') || 'Tap to view details'}
                    </div>
                </div>
            </div>
            {open && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: '16px 20px' }}>
                    {rec.notes && <div style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.muted, marginBottom: 14, fontStyle: 'italic' }}>📝 {rec.notes}</div>}
                    {METRIC_GROUPS.map(group => {
                        const filled = group.rows.filter(([, key]) => rec[key] !== null && rec[key] !== undefined);
                        if (!filled.length) return null;
                        return (
                            <div key={group.g} style={{ marginBottom: 16 }}>
                                <div style={{ fontFamily: T.mono, fontSize: '0.48rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.acc, marginBottom: 8 }}>{group.g}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                                    {filled.map(([label, key, unit]) => (
                                        <div key={key} style={{ background: T.faint, borderRadius: 6, padding: '8px 10px' }}>
                                            <div style={{ fontFamily: T.mono, fontSize: '0.46rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{label}</div>
                                            <div style={{ fontFamily: T.disp, fontSize: '1.2rem', color: T.hi, lineHeight: 1 }}>
                                                {rec[key]}<span style={{ fontSize: '0.6rem', color: T.muted, marginLeft: 3 }}>{unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function MyMeasurements() {
    const [measurements, setMeasurements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    useEffect(() => {
        api.get('/member/measurements')
            .then(r => setMeasurements(r.data.measurements || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardShell title="My Measurements">
            <style>{`
                .mym-fade { opacity:0; transform:translateY(10px); transition:all 0.4s ease; }
                .mym-fade.in { opacity:1; transform:none; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className={`mym-fade${mounted ? ' in' : ''}`}>
                <div style={{ marginBottom: 28 }}>
                    <div style={{ fontFamily: T.mono, fontSize: '0.5rem', color: T.acc, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>// body measurements</div>
                    <h1 style={{ fontFamily: T.disp, fontSize: '2.2rem', color: T.hi, letterSpacing: '0.04em', lineHeight: 1 }}>My Measurements</h1>
                    <p style={{ fontFamily: T.mono, fontSize: '0.62rem', color: T.muted, marginTop: 5 }}>
                        Recorded by your trainer · {measurements.length} record{measurements.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                        <div style={{ width: 24, height: 24, border: `2px solid ${T.acc}33`, borderTopColor: T.acc, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    </div>
                ) : measurements.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <ScaleIcon style={{ width: 40, color: T.faint, margin: '0 auto 16px', opacity: 0.4 }} />
                        <div style={{ fontFamily: T.mono, fontSize: '0.75rem', color: T.muted }}>No measurements recorded yet.</div>
                        <div style={{ fontFamily: T.mono, fontSize: '0.62rem', color: '#2a2a2a', marginTop: 6 }}>Your trainer will add entries after your body assessment sessions.</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {measurements.map(rec => (
                            <RecordCard key={rec.id} rec={rec} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
