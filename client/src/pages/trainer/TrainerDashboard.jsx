import React, { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import api from '../../utils/api';
import { UsersIcon, ClipboardDocumentListIcon, PlusIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TrainerDashboard() {
    const [members, setMembers] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [selected, setSelected] = useState(null);
    const [plan, setPlan] = useState([]);
    const [form, setForm] = useState({ exerciseId: '', day: 'Monday', sets: 3, reps: 12 });
    const [adding, setAdding] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    useEffect(() => {
        api.get('/trainer/members').then(r => setMembers(r.data.members)).catch(console.error);
        api.get('/trainer/exercises').then(r => setExercises(r.data.exercises)).catch(console.error);
    }, []);

    const loadPlan = async (mid) => {
        const r = await api.get(`/trainer/workouts/${mid}`);
        setPlan(r.data.plans);
    };

    const selectMember = (m) => { setSelected(m); loadPlan(m.id); };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!selected || !form.exerciseId) return;
        setAdding(true);
        try {
            await api.post('/trainer/workouts', { memberId: selected.id, ...form });
            await loadPlan(selected.id);
            setForm({ exerciseId: '', day: 'Monday', sets: 3, reps: 12 });
        } catch (err) { console.error(err); } finally { setAdding(false); }
    };

    const removePlan = async (id) => {
        await api.delete(`/trainer/workouts/${id}`);
        setPlan(p => p.filter(x => x.id !== id));
    };

    const generate = async () => {
        if (!selected) return;
        setGenerating(true);
        try {
            await api.post('/workouts/generate', { memberId: selected.id, experienceLevel: 'intermediate' });
            await loadPlan(selected.id);
        } catch (err) { console.error(err); } finally { setGenerating(false); }
    };

    const planByDay = DAYS.reduce((a, d) => { a[d] = plan.filter(p => p.day === d); return a; }, {});

    return (
        <DashboardShell title="Trainer">
            <div className={`fade-up ${mounted ? 'visible' : ''}`}>
                <div style={{ marginBottom: 28 }}>
                    <h1 className="page-title">Trainer Hub</h1>
                    <p className="page-subtitle">Build and manage personalized workout plans</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28, maxWidth: 480 }}>
                    {[
                        { label: 'My Members', val: members.length, color: '#fb923c' },
                        { label: 'Plan Entries', val: plan.length, color: '#ff5020' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,120,0,0.2)', borderRadius: 12, padding: '16px 20px' }}>
                            <div className="stat-label">{s.label}</div>
                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: s.color, letterSpacing: '0.04em' }}>{s.val}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
                    {/* Member list */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <span className="section-title">Members</span>
                        </div>
                        <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 520, overflowY: 'auto' }}>
                            {members.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: 24, fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)' }}>No members assigned</p>
                            ) : members.map(m => (
                                <button key={m.id} onClick={() => selectMember(m)} style={{
                                    textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                                    background: selected?.id === m.id ? 'rgba(255,100,0,0.12)' : 'transparent',
                                    border: `1px solid ${selected?.id === m.id ? 'rgba(255,80,20,0.3)' : 'transparent'}`,
                                    transition: 'all 0.15s',
                                }}>
                                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: selected?.id === m.id ? '#ff7040' : '#ccc' }}>{m.user?.name || m.name}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: 2, textTransform: 'capitalize' }}>{m.fitnessGoal?.replace('_', ' ')}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Plan builder */}
                    <div>
                        {!selected ? (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: '0.9rem' }}>
                                ← Select a member to build their plan
                            </div>
                        ) : (
                            <>
                                {/* Controls */}
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                        <div>
                                            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: '#fff' }}>Plan: </span>
                                            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: '#ff6030' }}>{selected.user?.name || selected.name}</span>
                                        </div>
                                        <button onClick={generate} disabled={generating} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
                                            {generating ? <span className="spinner" /> : <SparklesIcon style={{ width: 14, height: 14 }} />}
                                            AI Generate
                                        </button>
                                    </div>
                                    <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 8, alignItems: 'center' }}>
                                        <select value={form.exerciseId} onChange={e => setForm({ ...form, exerciseId: e.target.value })} className="input-field" style={{ fontSize: '0.82rem', paddingTop: 8, paddingBottom: 8 }}>
                                            <option value="">Select Exercise…</option>
                                            {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                                        </select>
                                        <select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="input-field" style={{ fontSize: '0.82rem', paddingTop: 8, paddingBottom: 8, width: 'auto' }}>
                                            {DAYS.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                        <input type="number" value={form.sets} onChange={e => setForm({ ...form, sets: +e.target.value })} placeholder="Sets" className="input-field" style={{ width: 65, fontSize: '0.82rem', paddingTop: 8, paddingBottom: 8, textAlign: 'center' }} />
                                        <input type="number" value={form.reps} onChange={e => setForm({ ...form, reps: +e.target.value })} placeholder="Reps" className="input-field" style={{ width: 65, fontSize: '0.82rem', paddingTop: 8, paddingBottom: 8, textAlign: 'center' }} />
                                        <button type="submit" disabled={adding} className="btn btn-primary btn-sm">
                                            {adding ? <span className="spinner" /> : <PlusIcon style={{ width: 14, height: 14 }} />}
                                        </button>
                                    </form>
                                </div>

                                {/* Days grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                    {DAYS.map(day => (
                                        <div key={day} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
                                            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', color: '#fff', letterSpacing: '0.06em' }}>{day}</span>
                                                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>{planByDay[day].length}</span>
                                            </div>
                                            <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 40 }}>
                                                {planByDay[day].length === 0 ? (
                                                    <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.18)', textAlign: 'center', padding: '6px 0' }}>Rest</p>
                                                ) : planByDay[day].map(p => (
                                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 7 }}>
                                                        <div>
                                                            <span style={{ fontSize: '0.75rem', color: '#ddd', fontWeight: 500 }}>{p.exercise.name}</span>
                                                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginLeft: 6 }}>{p.sets}×{p.reps}</span>
                                                        </div>
                                                        <button onClick={() => removePlan(p.id)} style={{ color: 'rgba(255,60,60,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                                            <TrashIcon style={{ width: 12, height: 12 }} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
