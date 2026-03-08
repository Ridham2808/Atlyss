import React, { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowPathIcon,
    SparklesIcon,
    XMarkIcon,
    ChevronRightIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

const T = {
    bg: '#080808', card: '#101010',
    border: '#1a1a1a', borderMid: '#252525',
    hi: '#efefef', text: '#c8c8c8', muted: '#484848', faint: '#262626',
    acc: '#f1642a', accDim: 'rgba(241,100,42,0.09)', accBorder: 'rgba(241,100,42,0.22)',
    amber: '#d09830', amberDim: 'rgba(208,152,48,0.09)', amberBorder: 'rgba(208,152,48,0.25)',
    green: '#4da870', greenDim: 'rgba(77,168,112,0.09)', greenBorder: 'rgba(77,168,112,0.22)',
    blue: '#5085cc', blueDim: 'rgba(80,133,204,0.09)', blueBorder: 'rgba(80,133,204,0.22)',
    mono: "'Space Mono', monospace",
    disp: "'Bebas Neue', sans-serif",
};

const BLANK_REQUEST = {
    dietGoal: 'Weight Loss',
    targetWeight: '',
    activityLevel: 'Moderate',
    workoutDuration: 45,
    sleepDuration: 8,
    dietType: 'Standard/Everything',
    preferredCuisine: '',
    mealsPerDay: 4,
    foodAllergies: '',
    foodsLike: '',
    foodsAvoid: '',
    healthConditions: '',
    dietaryRestrictions: '',
    waterIntake: '2L',
    smokingAlcohol: 'None',
    physicalLimitations: ''
};

const DIET_TYPES = ['Standard/Everything', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Intermittent Fasting', 'Low Carb', 'High Protein'];
const ACTIVITY_LEVELS = ['Sedentary', 'Lightly Active', 'Moderate', 'Very Active', 'Extra Active'];
const GOALS = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Fat Loss', 'Athletic Performance'];

const InputField = ({ style, ...props }) => (
    <input {...props} style={{ background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 3, padding: '8px 11px', fontFamily: T.mono, fontSize: '0.75rem', color: T.text, outline: 'none', width: '100%', ...style }} />
);

const SelectField = ({ style, children, ...props }) => (
    <select {...props} style={{ background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 3, padding: '8px 10px', fontFamily: T.mono, fontSize: '0.75rem', color: T.text, outline: 'none', cursor: 'pointer', appearance: 'none', width: '100%', ...style }}>{children}</select>
);

const TextArea = ({ style, ...props }) => (
    <textarea {...props} style={{ background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 3, padding: '8px 11px', fontFamily: T.mono, fontSize: '0.75rem', color: T.text, outline: 'none', width: '100%', resize: 'vertical', minHeight: 60, ...style }} />
);

const ModalLabel = ({ children }) => (
    <label style={{ display: 'block', fontFamily: T.mono, fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 5 }}>{children}</label>
);

export default function DietPlan() {
    const { user } = useAuth();
    const [activePlan, setActivePlan] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestForm, setRequestForm] = useState(BLANK_REQUEST);
    const [activeDay, setActiveDay] = useState(1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    const fetchPlan = async () => {
        setLoading(true);
        try {
            const res = await api.get('/diet/my-plan');
            setActivePlan(res.data.plan);
            setIsPending(res.data.isPending);
        } catch (err) {
            console.error('Fetch diet plan error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (user?.role === 'member') fetchPlan(); }, [user]);

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            await api.post('/diet/request', requestForm);
            setShowRequestForm(false);
            fetchPlan();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit diet request');
        } finally {
            setGenerating(false);
        }
    };

    if (user?.role !== 'member') {
        return (
            <DashboardShell title="Diet Plan">
                <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: T.mono, color: T.muted }}>
                    Access this page as a Member to view and request nutrition plans.
                </div>
            </DashboardShell>
        );
    }

    const currentDayMeals = activePlan?.meals?.filter(m => m.day === activeDay) || [];

    return (
        <DashboardShell title="Diet Plan">
            <style>{`
                .w-fade { opacity:0; transform:translateY(10px); transition:all 0.4s ease; }
                .w-fade.in { opacity:1; transform:none; }
                .day-btn { padding:10px 16px; border:1px solid ${T.border}; border-radius:4px; fontFamily:${T.mono}; fontSize:0.75rem; color:${T.muted}; cursor:pointer; background:transparent; transition:0.15s; text-transform:uppercase; font-weight:700; }
                .day-btn.active { border-color:${T.acc}; color:${T.acc}; background:${T.accDim}; }
                .meal-card { background:${T.card}; border:1px solid ${T.border}; border-radius:6px; padding:18px; margin-bottom:12px; display:flex; gap:20px; transition:0.15s; }
                .meal-card:hover { border-color:${T.borderMid}; background:#141414; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .pulse { animation: pulse 2s infinite; }
            `}</style>

            <div className={`w-fade${mounted ? ' in' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                    <div>
                        <div style={{ fontFamily: T.mono, fontSize: '0.52rem', color: T.acc, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>// nutrition strategy</div>
                        <h1 style={{ fontFamily: T.disp, fontSize: '2.4rem', color: T.hi, letterSpacing: '0.04em', lineHeight: 1 }}>Diet Plan</h1>
                        {activePlan && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                                <span style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.text, fontWeight: 700 }}>{activePlan.name}</span>
                                <span style={{ padding: '2px 8px', borderRadius: 2, fontSize: '0.52rem', fontFamily: T.mono, fontWeight: 700, textTransform: 'uppercase', background: isPending ? T.amberDim : T.greenDim, border: `1px solid ${isPending ? T.amberBorder : T.greenBorder}`, color: isPending ? T.amber : T.green }}>
                                    {isPending ? 'Pending Review' : 'Active'}
                                </span>
                            </div>
                        )}
                    </div>
                    {!loading && (
                        <button
                            onClick={() => setShowRequestForm(true)}
                            style={{
                                background: activePlan ? 'transparent' : T.acc,
                                border: activePlan ? `1px solid ${T.border}` : 'none',
                                borderRadius: 3, padding: '10px 20px', fontFamily: T.disp, fontSize: '1.1rem', color: activePlan ? T.text : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: '0.15s'
                            }}
                        >
                            <SparklesIcon style={{ width: 18 }} /> {activePlan ? 'RE-GENERATE PLAN' : 'CREATE DIET PLAN'}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><ArrowPathIcon style={{ width: 30, color: T.acc, animation: 'spin 1s linear infinite' }} /></div>
                ) : activePlan ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 30 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {[...Array(activePlan.duration)].map((_, i) => (
                                <button key={i} onClick={() => setActiveDay(i + 1)} className={`day-btn ${activeDay === i + 1 ? 'active' : ''}`}>
                                    Day {i + 1}
                                </button>
                            ))}

                            <div style={{ marginTop: 20, background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: 16 }}>
                                <ModalLabel>Goal</ModalLabel>
                                <div style={{ fontFamily: T.disp, fontSize: '1.4rem', color: T.hi, marginBottom: 12 }}>{activePlan.goal}</div>
                                {activePlan.recommendations && (
                                    <>
                                        <ModalLabel>Daily Rules</ModalLabel>
                                        <div style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.text, lineHeight: 1.4 }}>
                                            {activePlan.recommendations}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            {isPending && (
                                <div style={{ background: T.amberDim, border: `1px solid ${T.amberBorder}`, borderRadius: 4, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                    <ExclamationCircleIcon style={{ width: 20, color: T.amber }} />
                                    <div style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.amber }}>AI-generated draft awaiting nutritionist review.</div>
                                </div>
                            )}

                            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontFamily: T.disp, fontSize: '1.6rem', color: T.hi, letterSpacing: '0.04em' }}>Day {activeDay} Schedule</h2>
                                <span style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.muted }}>{currentDayMeals.length} Meals</span>
                            </div>

                            {currentDayMeals.map((meal) => (
                                <div key={meal.id} className="meal-card">
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                            <h3 style={{ fontFamily: T.disp, fontSize: '1.3rem', color: T.hi, letterSpacing: '0.03em' }}>{meal.mealName}</h3>
                                            <span style={{ fontSize: '0.55rem', fontFamily: T.mono, background: T.blueDim, color: T.blue, padding: '2px 8px', borderRadius: 2, fontWeight: 700, textTransform: 'uppercase' }}>{meal.mealType}</span>
                                        </div>
                                        <p style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.text, lineHeight: 1.5, marginBottom: 12 }}>{meal.description}</p>
                                        <div style={{ display: 'flex', gap: 14 }}>
                                            <div><ModalLabel>Calories</ModalLabel><div style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.hi }}>{meal.calories} kcal</div></div>
                                            <div><ModalLabel>Protein</ModalLabel><div style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.text }}>{meal.protein}g</div></div>
                                            <div><ModalLabel>Carbs</ModalLabel><div style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.text }}>{meal.carbs}g</div></div>
                                            <div><ModalLabel>Fats</ModalLabel><div style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.text }}>{meal.fats}g</div></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px 0', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8 }}>
                        <InformationCircleIcon style={{ width: 48, color: T.blue, margin: '0 auto 20px', opacity: 0.4 }} />
                        <h2 style={{ fontFamily: T.disp, fontSize: '2rem', color: T.hi, marginBottom: 8 }}>No Nutrition Plan</h2>
                        <p style={{ fontFamily: T.mono, fontSize: '0.8rem', color: T.muted, maxWidth: 400, margin: '0 auto 24px' }}>Let Atlyss AI craft a science-backed diet plan based on your metrics and lifestyle.</p>
                        <button onClick={() => setShowRequestForm(true)} style={{ background: T.hi, color: '#000', border: 'none', borderRadius: 3, padding: '10px 28px', fontFamily: T.mono, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', transition: '0.15s' }}>Start Generation</button>
                    </div>
                )}

                {showRequestForm && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, width: '100%', maxWidth: 740, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                                <div>
                                    <div style={{ fontFamily: T.mono, fontSize: '0.5rem', color: T.blue, letterSpacing: '0.2em', textTransform: 'uppercase' }}>// nutrition engine</div>
                                    <h2 style={{ fontFamily: T.disp, fontSize: '2rem', color: T.hi, letterSpacing: '0.04em' }}>Generate Diet Plan</h2>
                                </div>
                                <button onClick={() => setShowRequestForm(false)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer' }}><XMarkIcon style={{ width: 24 }} /></button>
                            </div>

                            <form onSubmit={handleSubmitRequest} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div><ModalLabel>Diet Goal</ModalLabel><SelectField value={requestForm.dietGoal} onChange={e => setRequestForm({ ...requestForm, dietGoal: e.target.value })}>{GOALS.map(g => <option key={g} value={g}>{g}</option>)}</SelectField></div>
                                    <div><ModalLabel>Target Weight (kg)</ModalLabel><InputField type="number" value={requestForm.targetWeight} onChange={e => setRequestForm({ ...requestForm, targetWeight: e.target.value })} /></div>
                                    <div><ModalLabel>Activity Level</ModalLabel><SelectField value={requestForm.activityLevel} onChange={e => setRequestForm({ ...requestForm, activityLevel: e.target.value })}>{ACTIVITY_LEVELS.map(a => <option key={a} value={a}>{a}</option>)}</SelectField></div>
                                    <div><ModalLabel>Workout Duration (min/day)</ModalLabel><InputField type="number" value={requestForm.workoutDuration} onChange={e => setRequestForm({ ...requestForm, workoutDuration: e.target.value })} /></div>
                                    <div><ModalLabel>Sleep Duration (hours)</ModalLabel><InputField type="number" value={requestForm.sleepDuration} onChange={e => setRequestForm({ ...requestForm, sleepDuration: e.target.value })} /></div>
                                    <div><ModalLabel>Diet Type</ModalLabel><SelectField value={requestForm.dietType} onChange={e => setRequestForm({ ...requestForm, dietType: e.target.value })}>{DIET_TYPES.map(d => <option key={d} value={d}>{d}</option>)}</SelectField></div>
                                    <div><ModalLabel>Preferred Cuisine</ModalLabel><InputField value={requestForm.preferredCuisine} onChange={e => setRequestForm({ ...requestForm, preferredCuisine: e.target.value })} placeholder="e.g. Indian, Meditteranean" /></div>
                                    <div><ModalLabel>Meals Per Day</ModalLabel><InputField type="number" value={requestForm.mealsPerDay} onChange={e => setRequestForm({ ...requestForm, mealsPerDay: e.target.value })} /></div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div><ModalLabel>Food Allergies</ModalLabel><InputField value={requestForm.foodAllergies} onChange={e => setRequestForm({ ...requestForm, foodAllergies: e.target.value })} placeholder="e.g. Peanuts, Dairy" /></div>
                                    <div><ModalLabel>Foods You Like</ModalLabel><TextArea value={requestForm.foodsLike} onChange={e => setRequestForm({ ...requestForm, foodsLike: e.target.value })} /></div>
                                    <div><ModalLabel>Foods To Avoid</ModalLabel><TextArea value={requestForm.foodsAvoid} onChange={e => setRequestForm({ ...requestForm, foodsAvoid: e.target.value })} /></div>
                                    <div><ModalLabel>Health Conditions</ModalLabel><InputField value={requestForm.healthConditions} onChange={e => setRequestForm({ ...requestForm, healthConditions: e.target.value })} /></div>
                                    <div><ModalLabel>Water Intake (Daily)</ModalLabel><InputField value={requestForm.waterIntake} onChange={e => setRequestForm({ ...requestForm, waterIntake: e.target.value })} /></div>
                                    <div><ModalLabel>Smoking / Alcohol</ModalLabel><InputField value={requestForm.smokingAlcohol} onChange={e => setRequestForm({ ...requestForm, smokingAlcohol: e.target.value })} /></div>
                                    <div><ModalLabel>Physical Limitations</ModalLabel><InputField value={requestForm.physicalLimitations} onChange={e => setRequestForm({ ...requestForm, physicalLimitations: e.target.value })} /></div>
                                </div>

                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: 12, marginTop: 10 }}>
                                    <button type="button" onClick={() => setShowRequestForm(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 3, color: T.muted, fontFamily: T.mono, textTransform: 'uppercase', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" disabled={generating} style={{ flex: 2, padding: '12px', background: T.acc, border: 'none', borderRadius: 3, color: '#fff', fontFamily: T.mono, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                        {generating ? <ArrowPathIcon style={{ width: 16, animation: 'spin 1s linear infinite' }} /> : 'Generate My Strategy'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
