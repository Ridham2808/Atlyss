import React, { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import api from '../../utils/api';
import {
    UserIcon, PhoneIcon, EnvelopeIcon, MapPinIcon,
    ScaleIcon, CalendarIcon, PencilIcon, CheckIcon,
    XMarkIcon, IdentificationIcon, BriefcaseIcon, FireIcon
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

const InfoRow = ({ label, value, mono = false, edit = false, type = 'text', onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontFamily: T.mono, fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: T.muted }}>{label}</div>
        {edit ? (
            <input
                type={type}
                value={value || ''}
                onChange={onChange}
                style={{
                    background: '#0a0a0a',
                    border: `1px solid ${T.borderMid}`,
                    borderRadius: 4,
                    padding: '6px 10px',
                    fontFamily: mono ? T.mono : 'inherit',
                    fontSize: '0.82rem',
                    color: T.hi,
                    outline: 'none',
                    width: '100%'
                }}
            />
        ) : (
            <div style={{ fontFamily: mono ? T.mono : 'inherit', fontSize: '0.85rem', color: value ? T.hi : T.muted }}>
                {value || '—'}
            </div>
        )}
    </div>
);

export default function MemberProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/member/profile');
            setProfile(res.data.user);
            setFormData({
                name: res.data.user.name,
                age: res.data.user.member?.age,
                gender: res.data.user.member?.gender,
                mobile: res.data.user.member?.mobile,
                address: res.data.user.member?.address,
                occupation: res.data.user.member?.occupation,
                height: res.data.user.member?.height,
                weight: res.data.user.member?.weight,
                fitnessGoal: res.data.user.member?.fitnessGoal,
            });
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/member/profile', formData);
            await fetchProfile();
            setIsEditing(false);
        } catch (err) {
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const updateF = (key) => (e) => setFormData(p => ({ ...p, [key]: e.target.value }));

    if (loading) return (
        <DashboardShell title="My Profile">
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                <div className="spinner" style={{ width: 24, height: 24 }} />
            </div>
        </DashboardShell>
    );

    const m = profile?.member || {};

    return (
        <DashboardShell title="My Profile">
            <style>{`
                .mp-fade { opacity:0; transform:translateY(12px); transition:all 0.4s ease; }
                .mp-fade.in { opacity:1; transform:none; }
                .mp-card { background:${T.card}; border:1px solid ${T.border}; border-radius:12px; padding:24px; }
            `}</style>

            <div className={`mp-fade${mounted ? ' in' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
                    <div>
                        <div style={{ fontFamily: T.mono, fontSize: '0.5rem', color: T.acc, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>// profile view</div>
                        <h1 style={{ fontFamily: T.disp, fontSize: '2.4rem', color: T.hi, letterSpacing: '0.04em', lineHeight: 1 }}>
                            {profile.name}
                        </h1>
                        <p style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.muted, marginTop: 6 }}>
                            Member ID: <span style={{ color: T.hi }}>{m.memberNo}</span> · Active since {new Date(m.joinDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(false)}
                                    style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 6, padding: '8px 16px', fontFamily: T.mono, fontSize: '0.7rem', color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <XMarkIcon style={{ width: 14 }} /> Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    style={{ background: T.acc, border: 'none', borderRadius: 6, padding: '8px 20px', fontFamily: T.mono, fontSize: '0.7rem', fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {saving ? 'Saving...' : <><CheckIcon style={{ width: 14 }} /> Save</>}
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)}
                                style={{ background: T.accDim, border: `1px solid ${T.accBorder}`, borderRadius: 6, padding: '8px 20px', fontFamily: T.mono, fontSize: '0.7rem', fontWeight: 700, color: T.acc, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <PencilIcon style={{ width: 14 }} /> Edit Details
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Profile Photo & Basic */}
                        <div className="mp-card" style={{ textAlign: 'center' }}>
                            <div style={{ width: 110, height: 110, borderRadius: '50%', background: T.faint, border: `2px solid ${T.border}`, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UserIcon style={{ width: 44, color: T.muted }} />
                            </div>
                            <InfoRow label="Full Name" value={formData.name} edit={isEditing} onChange={updateF('name')} />
                            <div style={{ marginTop: 12 }}>
                                <InfoRow label="Email Address" value={profile.email} mono />
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="mp-card">
                            <SectionHead icon={PhoneIcon} label="Contact Details" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <InfoRow label="Phone Number" value={formData.mobile} edit={isEditing} onChange={updateF('mobile')} />
                                <InfoRow label="Residence Address" value={formData.address} edit={isEditing} onChange={updateF('address')} />
                                <InfoRow label="Occupation" value={formData.occupation} edit={isEditing} onChange={updateF('occupation')} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Membership Status */}
                        <div className="mp-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, background: `linear-gradient(135deg, ${T.card}, #120a05)` }}>
                            <div style={{ borderRight: `1px solid ${T.border}`, paddingRight: 20 }}>
                                <SectionHead icon={IdentificationIcon} label="Membership" />
                                <div style={{ fontFamily: T.disp, fontSize: '1.4rem', color: T.hi, textTransform: 'uppercase' }}>{m.membershipType}</div>
                                <div style={{ fontFamily: T.mono, fontSize: '0.6rem', color: T.muted, marginTop: 4 }}>Due: {m.membershipDueDate ? new Date(m.membershipDueDate).toLocaleDateString() : 'Lifetime'}</div>
                            </div>
                            <div style={{ borderRight: `1px solid ${T.border}`, paddingRight: 20 }}>
                                <SectionHead icon={BriefcaseIcon} label="Trainer" />
                                <div style={{ fontFamily: T.hi, fontSize: '0.9rem', fontWeight: 600 }}>{m.trainer?.user?.name || 'Unassigned'}</div>
                                <div style={{ fontFamily: T.mono, fontSize: '0.6rem', color: T.muted, marginTop: 4 }}>Level 1 Personal Training</div>
                            </div>
                            <div>
                                <SectionHead icon={CalendarIcon} label="Preferences" />
                                <div style={{ fontFamily: T.hi, fontSize: '0.9rem', fontWeight: 600, textTransform: 'capitalize' }}>{m.sessionTime || 'Not set'}</div>
                                <div style={{ fontFamily: T.mono, fontSize: '0.6rem', color: T.muted, marginTop: 4 }}>Availability: Morning/Evening</div>
                            </div>
                        </div>

                        {/* Physical & Fitness */}
                        <div className="mp-card">
                            <SectionHead icon={ScaleIcon} label="Body Stats & Fitness" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                                <InfoRow label="Age" value={formData.age} edit={isEditing} type="number" onChange={updateF('age')} />
                                <InfoRow label="Gender" value={formData.gender} edit={isEditing} onChange={updateF('gender')} />
                                <InfoRow label="Height (cm)" value={formData.height} edit={isEditing} type="number" onChange={updateF('height')} />
                                <InfoRow label="Weight (kg)" value={formData.weight} edit={isEditing} type="number" onChange={updateF('weight')} />
                            </div>
                            <div style={{ marginTop: 24 }}>
                                <InfoRow label="Fitness Goal" value={formData.fitnessGoal} edit={isEditing} onChange={updateF('fitnessGoal')} />
                            </div>
                        </div>

                        {/* Activity */}
                        <div className="mp-card">
                            <SectionHead icon={FireIcon} label="Gym Activity" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div style={{ background: T.faint, padding: 16, borderRadius: 8 }}>
                                    <div style={{ fontFamily: T.mono, fontSize: '0.5rem', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Last Visit</div>
                                    <div style={{ fontFamily: T.disp, fontSize: '1.2rem', color: T.hi }}>{m.lastAttendance ? new Date(m.lastAttendance).toLocaleDateString() : 'Never'}</div>
                                </div>
                                <div style={{ background: T.faint, padding: 16, borderRadius: 8 }}>
                                    <div style={{ fontFamily: T.mono, fontSize: '0.5rem', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Workouts Generated</div>
                                    <div style={{ fontFamily: T.disp, fontSize: '1.2rem', color: T.hi }}>{profile.workoutRequests?.length || 0} Plans</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
