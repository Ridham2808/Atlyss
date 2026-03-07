import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import api from '../../utils/api';
import {
    UserIcon, PhoneIcon, MapPinIcon, ScaleIcon,
    AcademicCapIcon, ChevronLeftIcon, CheckIcon,
    PlusIcon, TrashIcon, SparklesIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';

const T = {
    bg: '#080808', card: '#101010',
    border: '#1a1a1a', borderMid: '#252525',
    hi: '#efefef', text: '#c8c8c8', muted: '#484848', faint: '#1c1c1c',
    acc: '#f1642a', accDim: 'rgba(241,100,42,0.09)', accBorder: 'rgba(241,100,42,0.22)',
    mono: "'Space Mono', monospace",
    disp: "'Bebas Neue', sans-serif",
};

const SectionHead = ({ icon: Icon, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Icon style={{ width: 16, height: 16, color: T.acc, flexShrink: 0 }} />
        <span style={{ fontFamily: T.mono, fontSize: '0.52rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: T.acc }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
);

const Inp = ({ label, value, onChange, type = 'text', placeholder = '', mono = false }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontFamily: T.mono, fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: T.muted }}>{label}</label>
        <input
            type={type} value={value || ''} onChange={onChange} placeholder={placeholder}
            style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${T.borderMid}`, borderRadius: 6, padding: '10px 14px', color: T.hi, outline: 'none', fontFamily: mono ? T.mono : 'inherit', fontSize: '0.85rem' }}
        />
    </div>
);

export default function TrainerProfileEdit() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    useEffect(() => {
        api.get('/trainer/profile')
            .then(res => {
                const u = res.data;
                const t = u.trainer || {};
                setFormData({
                    name: u.name,
                    mobile: t.mobile || '',
                    gender: t.gender || '',
                    age: t.age || '',
                    address: t.address || '',
                    weight: t.weight || '',
                    height: t.height || '',
                    specialization: t.specialization || '',
                    specializations: t.specializations || [],
                    fitnessJourney: t.fitnessJourney || '',
                    termsConditions: t.termsConditions || '',
                    certificates: t.certificates || [],
                    photo: t.photo || '',
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/trainer/profile', formData);
            navigate('/trainer/profile');
        } catch (err) {
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const setF = (key) => (e) => setFormData(p => ({ ...p, [key]: e.target.value }));

    const addItem = (key) => {
        const val = prompt(`Add new ${key.slice(0, -1)}:`);
        if (val) setFormData(p => ({ ...p, [key]: [...p[key], val] }));
    };

    const removeItem = (key, index) => {
        setFormData(p => ({ ...p, [key]: p[key].filter((_, i) => i !== index) }));
    };

    if (loading) return (
        <DashboardShell title="Edit Profile">
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                <div className="spinner" style={{ width: 24, height: 24 }} />
            </div>
        </DashboardShell>
    );

    return (
        <DashboardShell title="Edit Profile">
            <style>{`
                .tpe-fade { opacity:0; transform:translateY(12px); transition:all 0.4s ease; }
                .tpe-fade.in { opacity:1; transform:none; }
                .tpe-card { background:${T.card}; border:1px solid ${T.border}; border-radius:12px; padding:24px; }
            `}</style>

            <div className={`tpe-fade${mounted ? ' in' : ''}`}>
                <div style={{ marginBottom: 28 }}>
                    <button onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontFamily: T.mono, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: 0 }}>
                        <ChevronLeftIcon style={{ width: 14 }} /> BACK
                    </button>
                    <div style={{ fontFamily: T.mono, fontSize: '0.52rem', color: T.acc, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>// account settings</div>
                    <h1 style={{ fontFamily: T.disp, fontSize: '2.4rem', color: T.hi, letterSpacing: '0.04em' }}>Edit My Profile</h1>
                </div>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="tpe-card">
                        <SectionHead icon={UserIcon} label="Essentials" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <Inp label="Display Name" value={formData.name} onChange={setF('name')} />
                            <Inp label="Mobile Number" value={formData.mobile} onChange={setF('mobile')} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div className="tpe-card">
                            <SectionHead icon={ScaleIcon} label="Physical Info" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <Inp label="Age" type="number" value={formData.age} onChange={setF('age')} />
                                <Inp label="Gender" value={formData.gender} onChange={setF('gender')} />
                                <Inp label="Height (cm)" type="number" value={formData.height} onChange={setF('height')} />
                                <Inp label="Weight (kg)" type="number" value={formData.weight} onChange={setF('weight')} />
                            </div>
                        </div>
                        <div className="tpe-card">
                            <SectionHead icon={MapPinIcon} label="Residence" />
                            <Inp label="Full Address" value={formData.address} onChange={setF('address')} />
                        </div>
                    </div>

                    <div className="tpe-card">
                        <SectionHead icon={SparklesIcon} label="Professional Expertise" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                            <Inp label="Primary Specialization" value={formData.specialization} onChange={setF('specialization')} />
                        </div>
                        <div style={{ fontFamily: T.mono, fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: T.muted, marginBottom: 10 }}>Secondary Specializations</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {formData.specializations.map((s, i) => (
                                <div key={i} style={{ background: T.faint, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '0.75rem', color: T.hi }}>{s}</span>
                                    <TrashIcon onClick={() => removeItem('specializations', i)} style={{ width: 14, color: T.red, cursor: 'pointer' }} />
                                </div>
                            ))}
                            <button type="button" onClick={() => addItem('specializations')}
                                style={{ background: 'transparent', border: `1px dashed ${T.borderMid}`, borderRadius: 6, padding: '6px 12px', color: T.muted, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                <PlusIcon style={{ width: 14 }} /> Add
                            </button>
                        </div>
                    </div>

                    <div className="tpe-card">
                        <SectionHead icon={AcademicCapIcon} label="Certifications" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                            {formData.certificates.map((c, i) => (
                                <div key={i} style={{ background: T.faint, border: `1px solid ${T.border}`, borderRadius: 6, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <CheckIcon style={{ width: 16, color: T.acc }} />
                                    <span style={{ fontSize: '0.75rem', color: T.hi, flex: 1 }}>{c}</span>
                                    <TrashIcon onClick={() => removeItem('certificates', i)} style={{ width: 14, color: T.red, cursor: 'pointer' }} />
                                </div>
                            ))}
                            <button type="button" onClick={() => addItem('certificates')}
                                style={{ background: 'transparent', border: `1px dashed ${T.borderMid}`, borderRadius: 6, padding: '10px', color: T.muted, fontSize: '0.75rem', textAlign: 'center', cursor: 'pointer' }}>
                                + Add Certificate
                            </button>
                        </div>
                    </div>

                    <div className="tpe-card">
                        <SectionHead icon={DocumentTextIcon} label="About & Terms" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <label style={{ fontFamily: T.mono, fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: T.muted }}>Fitness Journey / Bio</label>
                                <textarea value={formData.fitnessJourney} onChange={setF('fitnessJourney')} rows={4}
                                    style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${T.borderMid}`, borderRadius: 6, padding: '10px 14px', color: T.hi, outline: 'none', resize: 'vertical', fontSize: '0.85rem', lineHeight: 1.6 }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <label style={{ fontFamily: T.mono, fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: T.muted }}>My Terms & Conditions</label>
                                <textarea value={formData.termsConditions} onChange={setF('termsConditions')} rows={4}
                                    style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${T.borderMid}`, borderRadius: 6, padding: '10px 14px', color: T.hi, outline: 'none', resize: 'vertical', fontSize: '0.85rem', lineHeight: 1.6 }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                        <button type="button" onClick={() => navigate(-1)}
                            style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, padding: '12px 24px', fontFamily: T.mono, fontSize: '0.75rem', color: T.muted, cursor: 'pointer' }}>
                            Cancel Changes
                        </button>
                        <button type="submit" disabled={saving}
                            style={{ background: T.acc, border: 'none', borderRadius: 8, padding: '12px 32px', fontFamily: T.mono, fontSize: '0.75rem', fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {saving ? 'Updating...' : <><CheckIcon style={{ width: 16 }} /> Save Profile</>}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardShell>
    );
}
