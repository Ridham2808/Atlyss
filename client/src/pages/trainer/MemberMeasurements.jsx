import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import api from '../../utils/api';
import { PlusIcon, TrashIcon, ChevronLeftIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const T = {
    bg: '#080808', card: '#101010',
    border: '#1a1a1a', borderMid: '#252525',
    hi: '#efefef', text: '#c8c8c8', muted: '#484848', faint: '#1c1c1c',
    acc: '#f1642a', accDim: 'rgba(241,100,42,0.09)', accBorder: 'rgba(241,100,42,0.22)',
    amber: '#d09830', amberDim: 'rgba(208,152,48,0.09)', amberBorder: 'rgba(208,152,48,0.25)',
    green: '#4da870', greenDim: 'rgba(77,168,112,0.09)', greenBorder: 'rgba(77,168,112,0.22)',
    red: '#e05050', redDim: 'rgba(224,80,80,0.08)', redBorder: 'rgba(224,80,80,0.22)',
    mono: "'Space Mono', monospace",
    disp: "'Bebas Neue', sans-serif",
};

const BLANK = {
    measuredAt: new Date().toISOString().slice(0, 10),
    notes: '',
    weight: '', height: '',
    neck: '', shoulder: '', chest: '', upperArm: '', forearm: '', wrist: '',
    upperAbdomen: '', waist: '', lowerAbdomen: '', hips: '', thigh: '', calf: '', ankle: '',
    bodyFat: '', visceralFat: '', restingMetabolism: '', bmi: '', biologicalAge: '',
};

const SECTIONS = [
    {
        label: 'Basic',
        fields: [
            { key: 'weight', label: 'Weight', unit: 'kg' },
            { key: 'height', label: 'Height', unit: 'cm' },
        ]
    },
    {
        label: 'Body Circumference (cm)',
        fields: [
            { key: 'neck', label: 'Neck', unit: 'cm' },
            { key: 'shoulder', label: 'Shoulder', unit: 'cm' },
            { key: 'chest', label: 'Chest (Normal)', unit: 'cm' },
            { key: 'upperArm', label: 'Upper Arm', unit: 'cm' },
            { key: 'forearm', label: 'Forearm', unit: 'cm' },
            { key: 'wrist', label: 'Wrist', unit: 'cm' },
            { key: 'upperAbdomen', label: 'Upper Abdomen', unit: 'cm' },
            { key: 'waist', label: 'Waist', unit: 'cm' },
            { key: 'lowerAbdomen', label: 'Lower Abdomen', unit: 'cm' },
            { key: 'hips', label: 'Hips', unit: 'cm' },
            { key: 'thigh', label: 'Thigh', unit: 'cm' },
            { key: 'calf', label: 'Calf', unit: 'cm' },
            { key: 'ankle', label: 'Ankle', unit: 'cm' },
        ]
    },
    {
        label: 'BCA Report',
        fields: [
            { key: 'bodyFat', label: 'B.F — Body Fat', unit: '%' },
            { key: 'visceralFat', label: 'V.F — Visceral Fat', unit: '' },
            { key: 'restingMetabolism', label: 'R.M — Resting Metabolism', unit: 'kcal' },
            { key: 'bmi', label: 'B.M.I — Body Mass Index', unit: '' },
            { key: 'biologicalAge', label: 'B.A — Biological Age', unit: 'yrs' },
        ]
    }
];

const Inp = ({ label, unit, value, onChange }) => {
    const [focus, setFocus] = useState(false);
    return (
        <div>
            <label style={{ display: 'block', fontFamily: T.mono, fontSize: '0.5rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: T.muted, marginBottom: 5 }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type="number" step="0.1" value={value} onChange={onChange}
                    onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
                    style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${focus ? T.acc : T.border}`, borderRadius: 4, padding: unit ? '8px 36px 8px 10px' : '8px 10px', fontFamily: T.mono, fontSize: '0.75rem', color: T.text, outline: 'none', boxSizing: 'border-box' }}
                    placeholder="—"
                />
                {unit && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontFamily: T.mono, fontSize: '0.55rem', color: T.muted }}>{unit}</span>}
            </div>
        </div>
    );
};

function FmtDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function RecordCard({ rec, onDelete, memberId }) {
    const [open, setOpen] = useState(false);
    const metrics = [
        { g: 'Basic', rows: [['Weight', rec.weight, 'kg'], ['Height', rec.height, 'cm']] },
        {
            g: 'Circumference', rows: [
                ['Neck', rec.neck, 'cm'], ['Shoulder', rec.shoulder, 'cm'], ['Chest', rec.chest, 'cm'],
                ['Upper Arm', rec.upperArm, 'cm'], ['Forearm', rec.forearm, 'cm'], ['Wrist', rec.wrist, 'cm'],
                ['Upper Abdomen', rec.upperAbdomen, 'cm'], ['Waist', rec.waist, 'cm'],
                ['Lower Abdomen', rec.lowerAbdomen, 'cm'], ['Hips', rec.hips, 'cm'],
                ['Thigh', rec.thigh, 'cm'], ['Calf', rec.calf, 'cm'], ['Ankle', rec.ankle, 'cm'],
            ]
        },
        {
            g: 'BCA Report', rows: [
                ['Body Fat (B.F)', rec.bodyFat, '%'], ['Visceral Fat (V.F)', rec.visceralFat, ''],
                ['Resting Metabolism (R.M)', rec.restingMetabolism, 'kcal'],
                ['BMI (B.M.I)', rec.bmi, ''], ['Biological Age (B.A)', rec.biologicalAge, 'yrs'],
            ]
        },
    ];

    return (
        <div style={{ background: T.card, border: `1px solid ${T.borderMid}`, borderRadius: 10, overflow: 'hidden' }}>
            {/* Header */}
            <div
                onClick={() => setOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {open ? <ChevronDownIcon style={{ width: 14, color: T.acc }} /> : <ChevronRightIcon style={{ width: 14, color: T.muted }} />}
                    <div>
                        <div style={{ fontFamily: T.mono, fontSize: '0.72rem', fontWeight: 700, color: T.hi }}>
                            {FmtDate(rec.measuredAt)}
                        </div>
                        <div style={{ fontFamily: T.mono, fontSize: '0.58rem', color: T.muted, marginTop: 2 }}>
                            {[rec.weight && `${rec.weight} kg`, rec.bodyFat && `B.F: ${rec.bodyFat}%`, rec.bmi && `BMI: ${rec.bmi}`].filter(Boolean).join(' · ') || 'View details'}
                        </div>
                    </div>
                </div>
                {onDelete && (
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(memberId, rec.id); }}
                        style={{ background: T.redDim, border: `1px solid ${T.redBorder}`, borderRadius: 4, padding: '5px 10px', color: T.red, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        title="Delete record"
                    >
                        <TrashIcon style={{ width: 12 }} />
                    </button>
                )}
            </div>

            {/* Expanded details */}
            {open && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: '16px 20px' }}>
                    {rec.notes && <div style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.muted, marginBottom: 14, fontStyle: 'italic' }}>Notes: {rec.notes}</div>}
                    {metrics.map(group => {
                        const filled = group.rows.filter(([, v]) => v !== null && v !== undefined);
                        if (!filled.length) return null;
                        return (
                            <div key={group.g} style={{ marginBottom: 16 }}>
                                <div style={{ fontFamily: T.mono, fontSize: '0.48rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.acc, marginBottom: 8 }}>{group.g}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                                    {filled.map(([label, val, unit]) => (
                                        <div key={label} style={{ background: T.faint, borderRadius: 6, padding: '8px 12px' }}>
                                            <div style={{ fontFamily: T.mono, fontSize: '0.48rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{label}</div>
                                            <div style={{ fontFamily: T.disp, fontSize: '1.2rem', color: T.hi, lineHeight: 1 }}>{val}<span style={{ fontSize: '0.6rem', color: T.muted, marginLeft: 3 }}>{unit}</span></div>
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

export default function MemberMeasurements() {
    const { memberId } = useParams();
    const navigate = useNavigate();

    const [member, setMember] = useState(null);
    const [measurements, setMeasurements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(BLANK);
    const [saving, setSaving] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const [mRes, measRes] = await Promise.all([
                    api.get('/trainer/members'),
                    api.get(`/trainer/members/${memberId}/measurements`),
                ]);
                const found = (mRes.data.members || []).find(m => m.id === parseInt(memberId));
                setMember(found || null);
                setMeasurements(measRes.data.measurements || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [memberId]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.post(`/trainer/members/${memberId}/measurements`, form);
            setMeasurements(prev => [res.data.measurement, ...prev]);
            setShowForm(false);
            setForm(BLANK);
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to save measurement');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (mId, recId) => {
        if (!confirm('Delete this measurement record?')) return;
        try {
            await api.delete(`/trainer/members/${mId}/measurements/${recId}`);
            setMeasurements(prev => prev.filter(m => m.id !== recId));
        } catch {
            alert('Failed to delete');
        }
    };

    const setF = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

    return (
        <DashboardShell title="Measurements">
            <style>{`
                .mm-fade { opacity:0; transform:translateY(10px); transition:all 0.4s ease; }
                .mm-fade.in { opacity:1; transform:none; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className={`mm-fade${mounted ? ' in' : ''}`}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <button onClick={() => navigate(-1)}
                            style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontFamily: T.mono, fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 10 }}>
                            <ChevronLeftIcon style={{ width: 14 }} /> BACK
                        </button>
                        <div style={{ fontFamily: T.mono, fontSize: '0.5rem', color: T.acc, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 5 }}>// body measurements</div>
                        <h1 style={{ fontFamily: T.disp, fontSize: '2.2rem', color: T.hi, letterSpacing: '0.04em', lineHeight: 1 }}>
                            {member?.user?.name || '...'}
                        </h1>
                        <p style={{ fontFamily: T.mono, fontSize: '0.62rem', color: T.muted, marginTop: 5 }}>
                            {measurements.length} record{measurements.length !== 1 ? 's' : ''} · Trainer entry only
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowForm(s => !s); setForm(BLANK); }}
                        style={{ background: T.acc, border: 'none', borderRadius: 7, padding: '10px 20px', fontFamily: T.mono, fontSize: '0.7rem', fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase' }}>
                        <PlusIcon style={{ width: 15 }} /> {showForm ? 'Cancel' : 'Add Measurement'}
                    </button>
                </div>

                {/* ── ADD FORM ── */}
                {showForm && (
                    <form onSubmit={handleSave} style={{ background: T.card, border: `1px solid ${T.accBorder}`, borderRadius: 12, padding: 24, marginBottom: 28 }}>
                        <div style={{ fontFamily: T.disp, fontSize: '1.2rem', color: T.hi, letterSpacing: '0.06em', marginBottom: 20 }}>New Measurement Entry</div>

                        {/* Date + Notes */}
                        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 14, marginBottom: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontFamily: T.mono, fontSize: '0.5rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: T.muted, marginBottom: 5 }}>Date of Measurement</label>
                                <input type="date" value={form.measuredAt} onChange={setF('measuredAt')}
                                    style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 4, padding: '8px 10px', fontFamily: T.mono, fontSize: '0.75rem', color: T.text, outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontFamily: T.mono, fontSize: '0.5rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: T.muted, marginBottom: 5 }}>Notes (optional)</label>
                                <input type="text" value={form.notes} onChange={setF('notes')} placeholder="e.g. Post workout, morning fasting"
                                    style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 4, padding: '8px 10px', fontFamily: T.mono, fontSize: '0.75rem', color: T.text, outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                        </div>

                        {SECTIONS.map(sec => (
                            <div key={sec.label} style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                    <span style={{ fontFamily: T.mono, fontSize: '0.48rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.acc }}>// {sec.label}</span>
                                    <div style={{ flex: 1, height: 1, background: T.border }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                                    {sec.fields.map(f => (
                                        <Inp key={f.key} label={f.label} unit={f.unit} value={form[f.key]} onChange={setF(f.key)} />
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                            <button type="button" onClick={() => setShowForm(false)}
                                style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 6, padding: '9px 20px', fontFamily: T.mono, fontSize: '0.7rem', color: T.muted, cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}
                                style={{ background: saving ? '#555' : T.acc, border: 'none', borderRadius: 6, padding: '9px 24px', fontFamily: T.mono, fontSize: '0.7rem', fontWeight: 700, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>
                                {saving ? 'Saving…' : 'Save Record'}
                            </button>
                        </div>
                    </form>
                )}

                {/* ── RECORDS LIST ── */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                        <div style={{ width: 24, height: 24, border: `2px solid ${T.acc}33`, borderTopColor: T.acc, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    </div>
                ) : measurements.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: T.muted, fontFamily: T.mono, fontSize: '0.75rem' }}>
                        No measurement records yet. Click "Add Measurement" to start.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {measurements.map(rec => (
                            <RecordCard key={rec.id} rec={rec} memberId={parseInt(memberId)} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
