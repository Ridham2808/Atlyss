import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
    UserIcon, PhoneIcon, EnvelopeIcon, MapPinIcon,
    StarIcon, TrophyIcon, AcademicCapIcon, ScaleIcon,
    CalendarIcon, ChevronLeftIcon, PencilIcon, CheckBadgeIcon,
    DocumentTextIcon, SparklesIcon, UsersIcon
} from '@heroicons/react/24/outline';

const T = {
    bg: '#080808', card: '#101010',
    border: '#1a1a1a', borderMid: '#252525',
    hi: '#efefef', text: '#c8c8c8', muted: '#484848', faint: '#1c1c1c',
    acc: '#f1642a', accDim: 'rgba(241,100,42,0.09)', accBorder: 'rgba(241,100,42,0.22)',
    amber: '#d09830', amberDim: 'rgba(208,152,48,0.09)', amberBorder: 'rgba(208,152,48,0.25)',
    green: '#4da870', greenDim: 'rgba(77,168,112,0.09)', greenBorder: 'rgba(77,168,112,0.22)',
    blue: '#5085cc', blueDim: 'rgba(80,133,204,0.09)', blueBorder: 'rgba(80,133,204,0.22)',
    red: '#e05050', redDim: 'rgba(224,80,80,0.09)', redBorder: 'rgba(224,80,80,0.22)',
    mono: "'Space Mono', monospace",
    disp: "'Bebas Neue', sans-serif",
};

const TYPE_META = {
    personal: { label: 'Personal Trainer', c: T.acc, dim: T.accDim, border: T.accBorder },
    general: { label: 'General Trainer', c: T.blue, dim: T.blueDim, border: T.blueBorder },
    common: { label: 'Common Trainer', c: T.amber, dim: T.amberDim, border: T.amberBorder },
};

const Chip = ({ label, color, border, bg }) => (
    <span style={{
        display: 'inline-block', background: bg || 'rgba(255,255,255,0.05)',
        border: `1px solid ${border || T.border}`, borderRadius: 3,
        padding: '3px 9px', fontFamily: T.mono, fontSize: '0.6rem',
        color: color || T.muted, letterSpacing: '0.05em'
    }}>{label}</span>
);

const SectionHead = ({ icon: Icon, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Icon style={{ width: 16, height: 16, color: T.acc, flexShrink: 0 }} />
        <span style={{ fontFamily: T.mono, fontSize: '0.52rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: T.acc }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
);

const InfoRow = ({ label, value, mono = false }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontFamily: T.mono, fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: T.muted }}>{label}</div>
        <div style={{ fontFamily: mono ? T.mono : 'inherit', fontSize: '0.82rem', color: value ? T.hi : T.muted, fontWeight: value ? 500 : 400 }}>
            {value || '—'}
        </div>
    </div>
);

const StarRow = ({ rating }) => (
    <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} style={{ width: 12, height: 12, color: i < rating ? T.amber : T.faint, fill: i < rating ? T.amber : 'none' }} />
        ))}
    </div>
);

export default function TrainerProfile() {
    const { id } = useParams(); // user id of trainer
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const isAdmin = authUser?.role === 'admin';
    const isSelf = authUser?.role === 'trainer' && !id; // trainer viewing own profile

    const [trainer, setTrainer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    const fetchTrainer = async () => {
        setLoading(true);
        try {
            if (isAdmin && id) {
                const res = await api.get(`/admin/trainers/${id}`);
                setTrainer(res.data);
            } else {
                // Trainer viewing their own profile
                const res = await api.get('/trainer/profile');
                setTrainer(res.data);
            }
        } catch (err) {
            console.error('Failed to load trainer profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTrainer(); }, [id]);

    const handleToggleActive = async () => {
        if (!confirm(`${trainer?.trainer?.isActive ? 'Deactivate' : 'Activate'} this trainer?`)) return;
        setToggling(true);
        try {
            const res = await api.patch(`/admin/trainers/${id}/toggle-active`);
            setTrainer(prev => ({ ...prev, trainer: { ...prev.trainer, isActive: res.data.isActive } }));
        } catch (err) {
            alert('Failed to update trainer status');
        } finally {
            setToggling(false);
        }
    };

    if (loading) return (
        <DashboardShell title="Trainer Profile">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
            </div>
        </DashboardShell>
    );

    if (!trainer) return (
        <DashboardShell title="Trainer Profile">
            <div style={{ textAlign: 'center', padding: 80, color: T.muted, fontFamily: T.mono }}>Trainer not found</div>
        </DashboardShell>
    );

    const t = trainer.trainer || {};
    const reviews = t.reviews || [];
    const members = t.members || [];
    const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
    const typeMeta = TYPE_META[t.trainerType] || TYPE_META.general;

    return (
        <DashboardShell title="Trainer Profile">
            <style>{`
                .tp-fade { opacity:0; transform:translateY(12px); transition:all 0.4s ease; }
                .tp-fade.in { opacity:1; transform:none; }
                .tp-card { background:${T.card}; border:1px solid ${T.border}; border-radius:10px; padding:24px; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className={`tp-fade${mounted ? ' in' : ''}`}>

                {/* ── Back + Header ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
                    <div>
                        {isAdmin && (
                            <button onClick={() => navigate('/trainers')}
                                style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontFamily: T.mono, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: 0 }}>
                                <ChevronLeftIcon style={{ width: 14 }} /> BACK TO TRAINERS
                            </button>
                        )}
                        <div style={{ fontFamily: T.mono, fontSize: '0.52rem', color: T.acc, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>// trainer profile</div>
                        <h1 style={{ fontFamily: T.disp, fontSize: '2.4rem', color: T.hi, letterSpacing: '0.04em', lineHeight: 1 }}>
                            {trainer.name}
                        </h1>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                            <span style={{ background: typeMeta.dim, border: `1px solid ${typeMeta.border}`, color: typeMeta.c, fontFamily: T.mono, fontSize: '0.58rem', fontWeight: 700, padding: '3px 10px', borderRadius: 3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                {typeMeta.label}
                            </span>
                            <span style={{ background: t.isActive ? T.greenDim : T.redDim, border: `1px solid ${t.isActive ? T.greenBorder : T.redBorder}`, color: t.isActive ? T.green : T.red, fontFamily: T.mono, fontSize: '0.58rem', fontWeight: 700, padding: '3px 10px', borderRadius: 3, textTransform: 'uppercase' }}>
                                {t.isActive ? '● ACTIVE' : '○ INACTIVE'}
                            </span>
                            {avgRating && (
                                <span style={{ fontFamily: T.mono, fontSize: '0.62rem', color: T.amber, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <StarIcon style={{ width: 12, fill: T.amber, color: T.amber }} /> {avgRating} / 5 ({reviews.length} reviews)
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right side actions */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexShrink: 0 }}>
                        {isAdmin && (
                            <button onClick={handleToggleActive} disabled={toggling}
                                style={{ background: t.isActive ? T.redDim : T.greenDim, border: `1px solid ${t.isActive ? T.redBorder : T.greenBorder}`, borderRadius: 6, padding: '9px 18px', fontFamily: T.mono, fontSize: '0.7rem', fontWeight: 700, color: t.isActive ? T.red : T.green, cursor: toggling ? 'not-allowed' : 'pointer', textTransform: 'uppercase' }}>
                                {toggling ? '...' : t.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        )}
                        {(isAdmin || isSelf) && (
                            <button onClick={() => navigate(isAdmin ? `/trainers` : '/trainer/profile/edit')}
                                style={{ background: T.accDim, border: `1px solid ${T.accBorder}`, borderRadius: 6, padding: '9px 18px', fontFamily: T.mono, fontSize: '0.7rem', fontWeight: 700, color: T.acc, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase' }}>
                                <PencilIcon style={{ width: 14 }} /> Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>

                    {/* ── LEFT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Photo + core info */}
                        <div className="tp-card" style={{ textAlign: 'center' }}>
                            <div style={{ width: 100, height: 100, borderRadius: '50%', background: T.faint, border: `2px solid ${T.border}`, margin: '0 auto 16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {t.photo ? (
                                    <img src={t.photo} alt={trainer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <UserIcon style={{ width: 40, color: T.muted }} />
                                )}
                            </div>
                            <div style={{ fontFamily: T.disp, fontSize: '1.4rem', color: T.hi, letterSpacing: '0.06em' }}>{trainer.name}</div>
                            <div style={{ fontFamily: T.mono, fontSize: '0.62rem', color: T.muted, marginTop: 4 }}>{trainer.email}</div>
                            {t.successRate && (
                                <div style={{ marginTop: 16 }}>
                                    <div style={{ fontFamily: T.mono, fontSize: '0.5rem', color: T.muted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Success Rate</div>
                                    <div style={{ height: 6, background: T.faint, borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${t.successRate}%`, background: `linear-gradient(90deg, ${T.green}, #7ddc9a)`, borderRadius: 3 }} />
                                    </div>
                                    <div style={{ fontFamily: T.disp, fontSize: '1.6rem', color: T.green, marginTop: 6 }}>{t.successRate}%</div>
                                </div>
                            )}
                        </div>

                        {/* Contact info */}
                        <div className="tp-card">
                            <SectionHead icon={PhoneIcon} label="Contact" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <InfoRow label="Mobile" value={t.mobile} />
                                <InfoRow label="Email" value={trainer.email} />
                                <InfoRow label="Address" value={t.address} />
                            </div>
                        </div>

                        {/* Physical */}
                        <div className="tp-card">
                            <SectionHead icon={ScaleIcon} label="Physical" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <InfoRow label="Gender" value={t.gender} />
                                <InfoRow label="Age" value={t.age ? `${t.age} yrs` : null} />
                                <InfoRow label="Height" value={t.height ? `${t.height} cm` : null} />
                                <InfoRow label="Weight" value={t.weight ? `${t.weight} kg` : null} />
                            </div>
                        </div>

                        {/* Members */}
                        <div className="tp-card">
                            <SectionHead icon={UsersIcon} label={`Members (${members.length})`} />
                            {members.length === 0 ? (
                                <div style={{ fontFamily: T.mono, fontSize: '0.68rem', color: T.muted, textAlign: 'center', padding: '12px 0' }}>No assigned members</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {members.map(m => (
                                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.faint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <UserIcon style={{ width: 14, color: T.muted }} />
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: T.text }}>{m.user?.name || '—'}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Employment */}
                        <div className="tp-card">
                            <SectionHead icon={CalendarIcon} label="Employment" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                                <InfoRow label="Join Date" value={t.gymJoinDate ? new Date(t.gymJoinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
                                <InfoRow label="Experience" value={t.experience ? `${t.experience} year${t.experience > 1 ? 's' : ''}` : null} />
                                {isAdmin && <InfoRow label="Salary" value={t.salary ? `₹ ${t.salary.toLocaleString()}` : null} />}
                            </div>
                        </div>

                        {/* Expertise */}
                        <div className="tp-card">
                            <SectionHead icon={SparklesIcon} label="Expertise & Specializations" />
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ fontFamily: T.mono, fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Primary Focus</div>
                                <div style={{ fontSize: '0.9rem', color: T.hi, fontWeight: 600 }}>{t.specialization || '—'}</div>
                            </div>
                            {t.specializations?.length > 0 && (
                                <div>
                                    <div style={{ fontFamily: T.mono, fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>All Specializations</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {t.specializations.map((s, i) => (
                                            <Chip key={i} label={s} color={T.acc} border={T.accBorder} bg={T.accDim} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Certificates */}
                        {(t.certificates?.length > 0 || isAdmin || isSelf) && (
                            <div className="tp-card">
                                <SectionHead icon={AcademicCapIcon} label="Certificates" />
                                {t.certificates?.length > 0 ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {t.certificates.map((cert, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.amberDim, border: `1px solid ${T.amberBorder}`, borderRadius: 6, padding: '6px 12px' }}>
                                                <CheckBadgeIcon style={{ width: 14, color: T.amber, flexShrink: 0 }} />
                                                <span style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.amber }}>{cert}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ fontFamily: T.mono, fontSize: '0.68rem', color: T.muted }}>No certificates listed</div>
                                )}
                            </div>
                        )}

                        {/* Fitness Journey */}
                        {t.fitnessJourney && (
                            <div className="tp-card">
                                <SectionHead icon={TrophyIcon} label="Fitness Journey" />
                                <p style={{ fontFamily: T.mono, fontSize: '0.72rem', color: T.text, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>
                                    {t.fitnessJourney}
                                </p>
                            </div>
                        )}

                        {/* Terms & Conditions */}
                        {t.termsConditions && (
                            <div className="tp-card">
                                <SectionHead icon={DocumentTextIcon} label="Terms &amp; Conditions" />
                                <p style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.muted, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>
                                    {t.termsConditions}
                                </p>
                            </div>
                        )}

                        {/* Member Reviews */}
                        <div className="tp-card">
                            <SectionHead icon={StarIcon} label={`Member Feedback (${reviews.length})`} />
                            {reviews.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '24px 0', fontFamily: T.mono, fontSize: '0.72rem', color: T.muted }}>No reviews yet</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {reviews.map(r => (
                                        <div key={r.id} style={{ background: T.faint, borderRadius: 8, padding: '14px 16px', borderLeft: `3px solid ${T.amber}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: T.amberDim, border: `1px solid ${T.amberBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <UserIcon style={{ width: 12, color: T.amber }} />
                                                    </div>
                                                    <span style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.text, fontWeight: 600 }}>
                                                        {r.member?.user?.name || 'Anonymous'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                    <StarRow rating={r.rating} />
                                                    <span style={{ fontFamily: T.mono, fontSize: '0.58rem', color: T.amber, marginLeft: 4 }}>{r.rating}/5</span>
                                                </div>
                                            </div>
                                            {r.comment && (
                                                <p style={{ fontFamily: T.mono, fontSize: '0.68rem', color: T.muted, lineHeight: 1.7, margin: 0 }}>{r.comment}</p>
                                            )}
                                            <div style={{ fontFamily: T.mono, fontSize: '0.52rem', color: T.faint, marginTop: 8, color: '#333' }}>
                                                {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
