import React, { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowPathIcon,
    ChevronRightIcon,
    UserIcon,
    ListBulletIcon,
    BeakerIcon,
    XMarkIcon,
    PencilSquareIcon,
    PlusIcon,
    TrashIcon,
    FireIcon
} from '@heroicons/react/24/outline';

const T = {
    bg: '#080808', card: '#101010',
    border: '#1a1a1a', borderMid: '#252525',
    hi: '#efefef', text: '#c8c8c8', muted: '#484848',
    acc: '#f1642a',
    green: '#4da870',
    blue: '#5085cc',
    mono: "'Space Mono', monospace",
    disp: "'Bebas Neue', sans-serif",
};

export default function ManageDiets() {
    const [pendingPlans, setPendingPlans] = useState([]);
    const [activePlans, setActivePlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [finalizing, setFinalizing] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [showMealModal, setShowMealModal] = useState(false);
    const [savingMeal, setSavingMeal] = useState(false);
    const [activeDay, setActiveDay] = useState(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pendingRes, activeRes] = await Promise.all([
                api.get('/diet/pending'),
                api.get('/diet/active')
            ]);
            setPendingPlans(pendingRes.data.plans || []);
            setActivePlans(activeRes.data.plans || []);
        } catch (err) {
            toast.error('Failed to fetch diet plans');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSaveMeal = async (e) => {
        e.preventDefault();
        setSavingMeal(true);
        try {
            const formData = new FormData(e.target);
            const mealData = Object.fromEntries(formData.entries());

            if (editingMeal.id) {
                await api.put(`/diet/plan/${selectedPlan.id}/meal/${editingMeal.id}`, mealData);
                toast.success('Meal updated');
            } else {
                await api.post(`/diet/plan/${selectedPlan.id}/meal`, { ...mealData, day: activeDay });
                toast.success('Meal added');
            }

            setShowMealModal(false);
            setEditingMeal(null);
            fetchData();

            // Re-select to refresh meals
            const updatedPending = await api.get('/diet/pending');
            const updatedActive = await api.get('/diet/active');
            const combined = [...updatedPending.data.plans, ...updatedActive.data.plans];
            setSelectedPlan(combined.find(p => p.id === selectedPlan.id));
        } catch (err) {
            toast.error('Failed to save meal');
        } finally {
            setSavingMeal(false);
        }
    };

    const handleDeleteMeal = async (mealId) => {
        if (!window.confirm('Are you sure you want to delete this meal?')) return;
        try {
            await api.delete(`/diet/plan/${selectedPlan.id}/meal/${mealId}`);
            toast.success('Meal removed');
            fetchData();

            const updatedPending = await api.get('/diet/pending');
            const updatedActive = await api.get('/diet/active');
            const combined = [...updatedPending.data.plans, ...updatedActive.data.plans];
            setSelectedPlan(combined.find(p => p.id === selectedPlan.id));
        } catch (err) {
            toast.error('Failed to delete meal');
        }
    };

    const handleFinalize = async (id) => {
        setFinalizing(true);
        try {
            await api.put(`/diet/plan/${id}/finalize`);
            toast.success('Diet plan finalized and activated');
            setSelectedPlan(null);
            fetchData();
        } catch (err) {
            toast.error('Finalization failed');
        } finally {
            setFinalizing(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const isPending = status === 'pending';
        return (
            <span style={{ padding: '2px 8px', borderRadius: 2, fontSize: '0.55rem', fontFamily: T.mono, fontWeight: 700, textTransform: 'uppercase', background: isPending ? 'rgba(208,152,48,0.1)' : 'rgba(77,168,112,0.1)', border: `1px solid ${isPending ? 'rgba(208,152,48,0.2)' : 'rgba(77,168,112,0.2)'}`, color: isPending ? T.amber : T.green }}>
                {status}
            </span>
        );
    };

    return (
        <DashboardShell title="Manage Diets">
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ marginBottom: 30 }}>
                    <div style={{ fontFamily: T.mono, fontSize: '0.55rem', color: T.acc, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>// nutritionist review portal</div>
                    <h1 style={{ fontFamily: T.disp, fontSize: '2.5rem', color: T.hi, letterSpacing: '0.04em' }}>Diet Plan Management</h1>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><ArrowPathIcon style={{ width: 30, color: T.acc, animation: 'spin 1s linear infinite' }} /></div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: selectedPlan ? '350px 1fr' : '1fr', gap: 30 }}>
                        {/* List Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <div style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.muted, textTransform: 'uppercase', borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>Pending Review ({pendingPlans.length})</div>

                            {pendingPlans.length === 0 && (
                                <div style={{ background: T.card, border: `1px dashed ${T.border}`, borderRadius: 8, padding: 40, textAlign: 'center', color: T.muted, fontSize: '0.8rem', fontFamily: T.mono }}>No pending diet plans for review.</div>
                            )}

                            {pendingPlans.map(plan => (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan)}
                                    style={{
                                        background: selectedPlan?.id === plan.id ? '#161616' : T.card,
                                        border: `1px solid ${selectedPlan?.id === plan.id ? T.acc : T.border}`,
                                        borderRadius: 8, padding: 20, cursor: 'pointer', transition: '0.15s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <UserIcon style={{ width: 16, color: T.text }} />
                                            </div>
                                            <div>
                                                <div style={{ color: T.hi, fontWeight: 700, fontSize: '0.9rem' }}>{plan.member?.user?.name}</div>
                                                <div style={{ color: T.muted, fontSize: '0.65rem', fontFamily: T.mono }}>{plan.member?.fitnessGoal?.toUpperCase()}</div>
                                            </div>
                                        </div>
                                        <StatusBadge status={plan.status} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 20 }}>
                                        <div><div style={{ fontSize: '0.5rem', color: T.muted, fontFamily: T.mono, textTransform: 'uppercase' }}>Current BMI</div><div style={{ fontSize: '0.8rem', color: T.hi, fontWeight: 700 }}>{plan.request?.bmi || 'N/A'}</div></div>
                                        <div><div style={{ fontSize: '0.5rem', color: T.muted, fontFamily: T.mono, textTransform: 'uppercase' }}>Target</div><div style={{ fontSize: '0.8rem', color: T.hi, fontWeight: 700 }}>{plan.request?.targetWeight || 'N/A'}kg</div></div>
                                    </div>
                                </div>
                            ))}

                            {/* Active Plans */}
                            {activePlans.length > 0 && (
                                <>
                                    <div style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.muted, textTransform: 'uppercase', borderBottom: `1px solid ${T.border}`, paddingBottom: 10, marginTop: 20 }}>Active Strategies ({activePlans.length})</div>
                                    {activePlans.map(plan => (
                                        <div
                                            key={plan.id}
                                            onClick={() => setSelectedPlan(plan)}
                                            style={{
                                                background: selectedPlan?.id === plan.id ? '#161616' : T.card,
                                                border: `1px solid ${selectedPlan?.id === plan.id ? T.acc : T.border}`,
                                                borderRadius: 8, padding: 20, cursor: 'pointer', transition: '0.15s', opacity: 0.8
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <UserIcon style={{ width: 16, color: T.text }} />
                                                    </div>
                                                    <div>
                                                        <div style={{ color: T.hi, fontWeight: 700, fontSize: '0.9rem' }}>{plan.member?.user?.name}</div>
                                                        <div style={{ color: T.muted, fontSize: '0.65rem', fontFamily: T.mono }}>{plan.member?.fitnessGoal?.toUpperCase()}</div>
                                                    </div>
                                                </div>
                                                <StatusBadge status={plan.status} />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Details Column */}
                        {selectedPlan && (
                            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 30, position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 }}>
                                    <div>
                                        <h2 style={{ fontFamily: T.disp, fontSize: '2rem', color: T.hi, letterSpacing: '0.04em' }}>{selectedPlan.member?.user?.name}'s Strategy</h2>
                                        <p style={{ fontFamily: T.mono, fontSize: '0.75rem', color: T.muted }}>// Generated by Antigravity AI (Gemini 2.5 Flash)</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button
                                            onClick={() => handleFinalize(selectedPlan.id)}
                                            disabled={finalizing}
                                            style={{ background: T.green, color: '#000', border: 'none', borderRadius: 4, padding: '10px 24px', fontFamily: T.mono, fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                                        >
                                            {finalizing ? <ArrowPathIcon style={{ width: 14, animation: 'spin 1s linear' }} /> : <CheckCircleIcon style={{ width: 14 }} />}
                                            FINALIZE & ACTIVATE
                                        </button>
                                        <button onClick={() => setSelectedPlan(null)} style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.muted, borderRadius: 4, padding: '8px', cursor: 'pointer' }}><XMarkIcon style={{ width: 20 }} /></button>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginBottom: 40 }}>
                                    <div>
                                        <div style={{ fontFamily: T.mono, fontSize: '0.6rem', color: T.muted, textTransform: 'uppercase', marginBottom: 15, borderBottom: '1px dashed #222', paddingBottom: 5 }}>Request Parameters</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                            <div><div style={{ fontSize: '0.55rem', color: T.muted, fontFamily: T.mono }}>GOAL</div><div style={{ color: T.hi, fontSize: '0.85rem' }}>{selectedPlan.request?.dietGoal}</div></div>
                                            <div><div style={{ fontSize: '0.55rem', color: T.muted, fontFamily: T.mono }}>TYPE</div><div style={{ color: T.hi, fontSize: '0.85rem' }}>{selectedPlan.request?.dietType}</div></div>
                                            <div><div style={{ fontSize: '0.55rem', color: T.muted, fontFamily: T.mono }}>CUISINE</div><div style={{ color: T.hi, fontSize: '0.85rem' }}>{selectedPlan.request?.preferredCuisine || 'None'}</div></div>
                                            <div><div style={{ fontSize: '0.55rem', color: T.muted, fontFamily: T.mono }}>ALLERGIES</div><div style={{ color: T.red || '#ff4d4d', fontSize: '0.85rem' }}>{selectedPlan.request?.foodAllergies || 'Clean'}</div></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: T.mono, fontSize: '0.6rem', color: T.muted, textTransform: 'uppercase', marginBottom: 15, borderBottom: '1px dashed #222', paddingBottom: 5 }}>Health Context</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                            <div><div style={{ fontSize: '0.55rem', color: T.muted, fontFamily: T.mono }}>BMI STATUS</div><div style={{ color: T.acc, fontSize: '0.85rem', fontWeight: 700 }}>{selectedPlan.request?.bmiStatus?.toUpperCase()}</div></div>
                                            <div><div style={{ fontSize: '0.55rem', color: T.muted, fontFamily: T.mono }}>RESTRICTIONS</div><div style={{ color: T.hi, fontSize: '0.85rem' }}>{selectedPlan.request?.dietaryRestrictions || 'None'}</div></div>
                                            <div><div style={{ fontSize: '0.55rem', color: T.muted, fontFamily: T.mono }}>LIMITATIONS</div><div style={{ color: T.hi, fontSize: '0.85rem' }}>{selectedPlan.request?.physicalLimitations || 'None'}</div></div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 8, padding: 25 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <ListBulletIcon style={{ width: 18, color: T.acc }} />
                                            <span style={{ fontFamily: T.disp, fontSize: '1.4rem', color: T.hi, letterSpacing: '0.04em' }}>Meal Schedule & Editor</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 5 }}>
                                            {[1, 2, 3, 4, 5, 6, 7].map(day => (
                                                <button
                                                    key={day}
                                                    onClick={() => setActiveDay(day)}
                                                    style={{
                                                        width: 28, height: 28, borderRadius: 4, border: `1px solid ${activeDay === day ? T.acc : T.border}`,
                                                        background: activeDay === day ? T.accDim : 'transparent', color: activeDay === day ? T.acc : T.muted,
                                                        fontFamily: T.mono, fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer'
                                                    }}
                                                >
                                                    D{day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {selectedPlan.meals?.filter(m => m.day === activeDay).map(meal => (
                                            <div key={meal.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: `1px solid ${T.border}` }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                                        <span style={{ fontSize: '0.55rem', fontFamily: T.mono, color: T.acc, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{meal.mealType}</span>
                                                        <span style={{ color: T.hi, fontWeight: 700, fontSize: '0.9rem' }}>{meal.mealName}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 15 }}>
                                                        <div style={{ fontSize: '0.6rem', color: T.muted, fontFamily: T.mono }}><FireIcon style={{ width: 10, display: 'inline', marginRight: 2 }} />{meal.calories} KCAL</div>
                                                        <div style={{ fontSize: '0.6rem', color: T.muted, fontFamily: T.mono }}>P: {meal.protein}g</div>
                                                        <div style={{ fontSize: '0.6rem', color: T.muted, fontFamily: T.mono }}>C: {meal.carbs}g</div>
                                                        <div style={{ fontSize: '0.6rem', color: T.muted, fontFamily: T.mono }}>F: {meal.fats}g</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={() => { setEditingMeal(meal); setShowMealModal(true); }} style={{ background: 'transparent', border: 'none', color: T.muted, cursor: 'pointer', padding: 5 }}><PencilSquareIcon style={{ width: 16 }} /></button>
                                                    <button onClick={() => handleDeleteMeal(meal.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: 5 }}><TrashIcon style={{ width: 16 }} /></button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => { setEditingMeal({}); setShowMealModal(true); }}
                                            style={{ marginTop: 10, background: 'rgba(255,255,255,0.03)', border: `1px dashed ${T.border}`, borderRadius: 6, padding: 12, width: '100%', color: T.muted, fontFamily: T.mono, fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                        >
                                            <PlusIcon style={{ width: 14 }} /> ADD MEAL TO DAY {activeDay}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Meal Modal */}
            {showMealModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 30, width: '100%', maxWidth: 500 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
                            <h2 style={{ fontFamily: T.disp, fontSize: '1.8rem', color: T.hi }}>{editingMeal.id ? 'Edit Meal' : 'Add New Meal'}</h2>
                            <button onClick={() => setShowMealModal(false)} style={{ background: 'transparent', border: 'none', color: T.muted, cursor: 'pointer' }}><XMarkIcon style={{ width: 24 }} /></button>
                        </div>
                        <form onSubmit={handleSaveMeal}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.6rem', color: T.muted, fontFamily: T.mono, marginBottom: 8 }}>MEAL NAME</label>
                                    <input name="mealName" defaultValue={editingMeal.mealName} required style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 4, padding: '10px 12px', color: T.hi, fontSize: '0.9rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.6rem', color: T.muted, fontFamily: T.mono, marginBottom: 8 }}>MEAL TYPE</label>
                                    <select name="mealType" defaultValue={editingMeal.mealType || 'Breakfast'} style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 4, padding: '10px 12px', color: T.hi, fontSize: '0.9rem' }}>
                                        <option>Breakfast</option>
                                        <option>Lunch</option>
                                        <option>Dinner</option>
                                        <option>Snack</option>
                                        <option>Pre-Workout</option>
                                        <option>Post-Workout</option>
                                    </select>
                                </div>
                                <div />
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.6rem', color: T.muted, fontFamily: T.mono, marginBottom: 8 }}>CALORIES</label>
                                    <input name="calories" type="number" defaultValue={editingMeal.calories} style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 4, padding: '10px 12px', color: T.hi, fontSize: '0.9rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.6rem', color: T.muted, fontFamily: T.mono, marginBottom: 8 }}>PROTEIN (G)</label>
                                    <input name="protein" type="number" step="0.1" defaultValue={editingMeal.protein} style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 4, padding: '10px 12px', color: T.hi, fontSize: '0.9rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.6rem', color: T.muted, fontFamily: T.mono, marginBottom: 8 }}>CARBS (G)</label>
                                    <input name="carbs" type="number" step="0.1" defaultValue={editingMeal.carbs} style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 4, padding: '10px 12px', color: T.hi, fontSize: '0.9rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.6rem', color: T.muted, fontFamily: T.mono, marginBottom: 8 }}>FATS (G)</label>
                                    <input name="fats" type="number" step="0.1" defaultValue={editingMeal.fats} style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 4, padding: '10px 12px', color: T.hi, fontSize: '0.9rem' }} />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.6rem', color: T.muted, fontFamily: T.mono, marginBottom: 8 }}>DESCRIPTION / INSTRUCTIONS</label>
                                    <textarea name="description" defaultValue={editingMeal.description} rows={3} style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 4, padding: '10px 12px', color: T.hi, fontSize: '0.85rem' }} />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={savingMeal}
                                style={{ marginTop: 30, width: '100%', background: T.acc, color: '#000', border: 'none', borderRadius: 4, padding: 14, fontFamily: T.mono, fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            >
                                {savingMeal ? 'SAVING...' : 'SAVE MEAL SPECIFICATIONS'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </DashboardShell>
    );
}
