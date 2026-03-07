import React, { useEffect, useState } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DIFF_COLOR = {
    beginner: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', text: '#4ade80' },
    intermediate: { bg: 'rgba(255,180,0,0.08)', border: 'rgba(255,180,0,0.25)', text: '#fbbf24' },
    advanced: { bg: 'rgba(255,60,20,0.1)', border: 'rgba(255,80,20,0.3)', text: '#ff7050' },
};

export default function Workouts() {
    const { user } = useAuth();
    const [grouped, setGrouped] = useState({});
    const [exercises, setExercises] = useState([]);
    const [activeDay, setActiveDay] = useState('Monday');
    const [filter, setFilter] = useState({ muscleGroup: '', difficulty: '' });
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(user?.role === 'member' ? 'plan' : 'library');
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    useEffect(() => {
        if (user?.role === 'member') api.get('/member/workouts').then(r => setGrouped(r.data.grouped || {})).catch(console.error);
        api.get('/workouts/exercises').then(r => setExercises(r.data.exercises)).catch(console.error).finally(() => setLoading(false));
    }, [user]);

    const filtered = exercises.filter(ex =>
        (!filter.muscleGroup || ex.muscleGroup.toLowerCase().includes(filter.muscleGroup.toLowerCase())) &&
        (!filter.difficulty || ex.difficulty === filter.difficulty)
    );
    const muscleGroups = [...new Set(exercises.map(e => e.muscleGroup))];

    return (
        <DashboardShell title="Workouts">
            <div className={`fade-up ${mounted ? 'visible' : ''}`}>
                <div style={{ marginBottom: 24 }}>
                    <h1 className="page-title">Workouts</h1>
                    <p className="page-subtitle">Your plan and exercise library</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    {user?.role === 'member' && (
                        <button onClick={() => setView('plan')} className="btn" style={{
                            background: view === 'plan' ? 'linear-gradient(135deg,#ff3d00,#ff6d00)' : 'rgba(255,255,255,0.04)',
                            border: view === 'plan' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                            color: view === 'plan' ? '#fff' : 'rgba(255,255,255,0.4)',
                            boxShadow: view === 'plan' ? '0 4px 16px rgba(255,60,0,0.25)' : 'none',
                        }}>My Plan</button>
                    )}
                    <button onClick={() => setView('library')} className="btn" style={{
                        background: view === 'library' ? 'linear-gradient(135deg,#ff3d00,#ff6d00)' : 'rgba(255,255,255,0.04)',
                        border: view === 'library' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        color: view === 'library' ? '#fff' : 'rgba(255,255,255,0.4)',
                        boxShadow: view === 'library' ? '0 4px 16px rgba(255,60,0,0.25)' : 'none',
                    }}>Exercise Library</button>
                </div>

                {/* Plan view */}
                {view === 'plan' && user?.role === 'member' && (
                    <div>
                        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
                            {DAYS.map(d => <button key={d} onClick={() => setActiveDay(d)} className={`day-tab ${activeDay === d ? 'active' : ''}`}>{d}</button>)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {(grouped[activeDay] || []).length === 0 ? (
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
                                    {activeDay === 'Sunday' ? '🌄 Rest day — recovery is part of the program.' : 'No exercises scheduled for this day.'}
                                </div>
                            ) : (grouped[activeDay] || []).map(p => (
                                <div key={p.id} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>{p.exercise.name}</h3>
                                        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>{p.exercise.muscleGroup} · {p.exercise.difficulty}</p>
                                        {p.exercise.instructions && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 8, lineHeight: 1.6 }}>{p.exercise.instructions}</p>}
                                        {p.exercise.videoUrl && <a href={p.exercise.videoUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#ff5020', marginTop: 8, textDecoration: 'none', fontWeight: 500 }}>▶ Watch Video</a>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                                        {[{ v: p.sets, l: 'Sets', c: '#ff5020' }, { v: p.reps, l: 'Reps', c: '#fb923c' }].map(b => (
                                            <div key={b.l} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
                                                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem', color: b.c, lineHeight: 1 }}>{b.v}</div>
                                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>{b.l}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Library view */}
                {view === 'library' && (
                    <div>
                        {/* Filters */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                            <select value={filter.muscleGroup} onChange={e => setFilter({ ...filter, muscleGroup: e.target.value })} className="input-field" style={{ width: 'auto', paddingTop: 8, paddingBottom: 8, fontSize: '0.82rem' }}>
                                <option value="">All Muscle Groups</option>
                                {muscleGroups.map(g => <option key={g}>{g}</option>)}
                            </select>
                            <select value={filter.difficulty} onChange={e => setFilter({ ...filter, difficulty: e.target.value })} className="input-field" style={{ width: 'auto', paddingTop: 8, paddingBottom: 8, fontSize: '0.82rem' }}>
                                <option value="">All Levels</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                            {(filter.muscleGroup || filter.difficulty) && (
                                <button onClick={() => setFilter({ muscleGroup: '', difficulty: '' })} className="btn btn-secondary btn-sm">Clear filters</button>
                            )}
                        </div>

                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                                <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
                                {filtered.map(ex => {
                                    const dc = DIFF_COLOR[ex.difficulty] || DIFF_COLOR.beginner;
                                    return (
                                        <div key={ex.id} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20, transition: 'all 0.18s' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,80,20,0.28)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'none'; }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
                                                <h3 style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem', flex: 1 }}>{ex.name}</h3>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20, border: '1px solid', background: dc.bg, borderColor: dc.border, color: dc.text, flexShrink: 0 }}>
                                                    {ex.difficulty}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.72rem', color: '#ff6030', fontWeight: 500, letterSpacing: '0.04em', marginBottom: 8 }}>{ex.muscleGroup}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ex.instructions}</p>
                                            {ex.videoUrl && <a href={ex.videoUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: '#ff5020', marginTop: 10, textDecoration: 'none', fontWeight: 500 }}>▶ Watch Video</a>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
