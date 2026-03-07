import React, { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import api from '../../utils/api';
import {
    UserIcon, EnvelopeIcon, PencilIcon, CheckIcon,
    XMarkIcon, ShieldCheckIcon, CalendarIcon, HeartIcon
} from '@heroicons/react/24/outline';

const T = {
    bg: '#080808', card: '#101010',
    border: '#1a1a1a', borderMid: '#252525',
    hi: '#efefef', text: '#c8c8c8', muted: '#484848', faint: '#1c1c1c',
    acc: '#f1642a',
    mono: "'Space Mono', monospace",
    disp: "'Bebas Neue', sans-serif",
};

export default function AdminProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [saving, setSaving] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/admin/profile');
            setProfile(res.data);
            setFormData({ name: res.data.name, email: res.data.email });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/admin/profile', formData);
            await fetchProfile();
            setIsEditing(false);
        } catch (err) {
            alert('Failed to update admin profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <DashboardShell title="Admin Profile">
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                <div className="spinner" style={{ width: 24, height: 24 }} />
            </div>
        </DashboardShell>
    );

    return (
        <DashboardShell title="My Profile">
            <style>{`
                .ap-fade { opacity:0; transform:translateY(12px); transition:all 0.4s ease; }
                .ap-fade.in { opacity:1; transform:none; }
                .ap-card { background:${T.card}; border:1px solid ${T.border}; border-radius:12px; padding:32px; }
            `}</style>

            <div className={`ap-fade${mounted ? ' in' : ''}`} style={{ maxWidth: 600, margin: '0 auto' }}>
                <div className="ap-card">
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{ width: 120, height: 120, borderRadius: '50%', background: T.faint, border: `2px solid ${T.border}`, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <UserIcon style={{ width: 48, color: T.muted }} />
                            <div style={{ position: 'absolute', bottom: 5, right: 5, background: T.acc, borderRadius: '50%', padding: 6 }}>
                                <ShieldCheckIcon style={{ width: 14, color: '#fff' }} />
                            </div>
                        </div>
                        <div style={{ fontFamily: T.mono, fontSize: '0.52rem', color: T.acc, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>// system administrator</div>
                        <h1 style={{ fontFamily: T.disp, fontSize: '2.8rem', color: T.hi, lineHeight: 1 }}>{profile.name}</h1>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24 }}>
                            <div style={{ fontFamily: T.mono, fontSize: '0.6rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Display Name</div>
                            {isEditing ? (
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${T.borderMid}`, borderRadius: 6, padding: '10px 14px', color: T.hi, outline: 'none' }}
                                />
                            ) : (
                                <div style={{ fontSize: '1.1rem', color: T.hi, fontWeight: 500 }}>{profile.name}</div>
                            )}
                        </div>

                        <div>
                            <div style={{ fontFamily: T.mono, fontSize: '0.6rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Email Login</div>
                            {isEditing ? (
                                <input
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${T.borderMid}`, borderRadius: 6, padding: '10px 14px', color: T.hi, outline: 'none' }}
                                />
                            ) : (
                                <div style={{ fontSize: '1rem', color: T.hi, fontFamily: T.mono }}>{profile.email}</div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)}
                                        style={{ flex: 1, background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, padding: '12px', fontFamily: T.mono, fontSize: '0.75rem', color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <XMarkIcon style={{ width: 16 }} /> Cancel
                                    </button>
                                    <button onClick={handleSave} disabled={saving}
                                        style={{ flex: 1, background: T.acc, border: 'none', borderRadius: 8, padding: '12px', fontFamily: T.mono, fontSize: '0.75rem', fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        {saving ? 'Saving...' : <><CheckIcon style={{ width: 16 }} /> Save Changes</>}
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)}
                                    style={{ width: '100%', background: '#1c1c1c', border: `1px solid ${T.borderMid}`, borderRadius: 8, padding: '12px', fontFamily: T.mono, fontSize: '0.75rem', fontWeight: 700, color: T.hi, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <PencilIcon style={{ width: 16 }} /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: 40, paddingTop: 32, borderTop: `1px dashed ${T.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: T.muted, marginBottom: 8 }}><CalendarIcon style={{ width: 24, margin: '0 auto' }} /></div>
                            <div style={{ fontFamily: T.mono, fontSize: '0.55rem', color: T.muted, textTransform: 'uppercase' }}>Member Since</div>
                            <div style={{ color: T.hi, fontSize: '0.9rem', fontWeight: 500, marginTop: 4 }}>{new Date(profile.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: T.muted, marginBottom: 8 }}><HeartIcon style={{ width: 24, margin: '0 auto' }} /></div>
                            <div style={{ fontFamily: T.mono, fontSize: '0.55rem', color: T.muted, textTransform: 'uppercase' }}>Account Role</div>
                            <div style={{ color: T.acc, fontSize: '0.9rem', fontWeight: 600, marginTop: 4, textTransform: 'uppercase' }}>{profile.role}</div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
