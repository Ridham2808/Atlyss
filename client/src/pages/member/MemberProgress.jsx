import React, { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import api from '../../utils/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import { ScaleIcon, FireIcon, BeakerIcon, ChartBarIcon } from '@heroicons/react/24/outline';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const T = {
    bg: '#080808', card: '#101010',
    border: '#1a1a1a', borderMid: '#252525',
    hi: '#efefef', text: '#c8c8c8', muted: '#484848', faint: '#1c1c1c',
    acc: '#f1642a', accDim: 'rgba(241,100,42,0.1)', accBorder: 'rgba(241,100,42,0.25)',
    blue: '#4a7ec7', blueDim: 'rgba(74,126,199,0.1)',
    green: '#4da870', greenDim: 'rgba(77,168,112,0.1)',
    mono: "'Space Mono', monospace",
    disp: "'Bebas Neue', sans-serif",
};

const ChartCard = ({ title, data, label, color, unit }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#111',
                titleFont: { family: 'Space Mono', size: 10 },
                bodyFont: { family: 'Space Mono', size: 12 },
                padding: 12,
                borderColor: '#222',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: (context) => ` ${context.parsed.y} ${unit}`
                }
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#444', font: { family: 'Space Mono', size: 9 } }
            },
            y: {
                grid: { color: '#1a1a1a' },
                ticks: { color: '#444', font: { family: 'Space Mono', size: 9 } }
            }
        },
        elements: {
            line: { tension: 0.4 },
            point: { radius: 4, hoverRadius: 6, backgroundColor: color }
        }
    };

    const chartData = {
        labels: data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
            label: label,
            data: data.map(d => d.val),
            borderColor: color,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, color.replace('1)', '0.15)'));
                gradient.addColorStop(1, color.replace('1)', '0)'));
                return gradient;
            },
            fill: true,
            borderWidth: 2,
        }]
    };

    return (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, height: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontFamily: T.mono, fontSize: '0.6rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{title}</div>
                <div style={{ fontFamily: T.disp, fontSize: '1.4rem', color: color }}>
                    {data.length > 0 ? data[data.length - 1].val : '—'} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{unit}</span>
                </div>
            </div>
            <div style={{ height: 220 }}>
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
};

export default function MemberProgress() {
    const { memberId } = useParams();
    const [measurements, setMeasurements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    useEffect(() => {
        const url = memberId ? `/trainer/members/${memberId}/measurements` : '/member/measurements';
        api.get(url)
            .then(res => {
                const raw = res.data.measurements || [];
                const sorted = [...raw].sort((a, b) => new Date(a.measuredAt) - new Date(b.measuredAt));
                setMeasurements(sorted);
            })
            .catch(err => console.error('Failed to load progress data:', err))
            .finally(() => setLoading(false));
    }, [memberId]);

    if (loading) return (
        <DashboardShell title="My Progress">
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                <div className="spinner" style={{ width: 24, height: 24 }} />
            </div>
        </DashboardShell>
    );

    const weightData = measurements.map(m => ({ date: m.measuredAt, val: m.weight })).filter(d => d.val);
    const bodyFatData = measurements.map(m => ({ date: m.measuredAt, val: m.bodyFat })).filter(d => d.val);
    const bmiData = measurements.map(m => ({ date: m.measuredAt, val: m.bmi })).filter(d => d.val);
    const waistData = measurements.map(m => ({ date: m.measuredAt, val: m.waist })).filter(d => d.val);

    return (
        <DashboardShell title="My Progress">
            <style>{`
                .p-fade { opacity:0; transform:translateY(12px); transition:all 0.44s ease; }
                .p-fade.in { opacity:1; transform:none; }
            `}</style>

            <div className={`p-fade${mounted ? ' in' : ''}`}>
                <div style={{ marginBottom: 30 }}>
                    <div style={{ fontFamily: T.mono, fontSize: '0.52rem', color: T.acc, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>// analytics & tracking</div>
                    <h1 style={{ fontFamily: T.disp, fontSize: '2.4rem', color: T.hi, letterSpacing: '0.04em', lineHeight: 1 }}>Performance Progress</h1>
                    <p style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.muted, marginTop: 6 }}>Visual history of your body assessment results</p>
                </div>

                {measurements.length < 2 ? (
                    <div style={{ background: T.card, border: `1px dashed ${T.border}`, borderRadius: 12, padding: 80, textAlign: 'center' }}>
                        <ChartBarIcon style={{ width: 44, color: T.faint, margin: '0 auto 16px', opacity: 0.4 }} />
                        <div style={{ fontFamily: T.mono, fontSize: '0.85rem', color: T.muted }}>Not enough data to generate charts.</div>
                        <div style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.faint, marginTop: 6 }}>You need at least two measurement records to see progress trends.</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
                        <ChartCard
                            title="Body Weight"
                            data={weightData}
                            label="Weight"
                            color="rgba(241,100,42,1)"
                            unit="kg"
                        />
                        <ChartCard
                            title="Body Fat Percentage"
                            data={bodyFatData}
                            label="B.F %"
                            color="rgba(74,126,199,1)"
                            unit="%"
                        />
                        <ChartCard
                            title="BMI Status"
                            data={bmiData}
                            label="BMI"
                            color="rgba(77,168,112,1)"
                            unit=""
                        />
                        <ChartCard
                            title="Waistline"
                            data={waistData}
                            label="Waist"
                            color="rgba(208,152,48,1)"
                            unit="cm"
                        />
                    </div>
                )}

                {/* Summary Section */}
                {measurements.length >= 2 && (
                    <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                        <div style={{ background: T.faint, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <ScaleIcon style={{ width: 14, color: T.acc }} />
                                <span style={{ fontFamily: T.mono, fontSize: '0.55rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Weight Change</span>
                            </div>
                            <div style={{ fontFamily: T.disp, fontSize: '1.8rem', color: T.hi }}>
                                {(weightData[weightData.length - 1]?.val - weightData[0]?.val).toFixed(1)} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>kg</span>
                            </div>
                            <div style={{ fontFamily: T.mono, fontSize: '0.58rem', color: T.muted, marginTop: 4 }}>Since first record</div>
                        </div>
                        <div style={{ background: T.faint, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <FireIcon style={{ width: 14, color: T.blue }} />
                                <span style={{ fontFamily: T.mono, fontSize: '0.55rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fat Loss/Gain</span>
                            </div>
                            <div style={{ fontFamily: T.disp, fontSize: '1.8rem', color: T.hi }}>
                                {bodyFatData.length > 1 ? (bodyFatData[bodyFatData.length - 1].val - bodyFatData[0].val).toFixed(1) : '0.0'} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>%</span>
                            </div>
                            <div style={{ fontFamily: T.mono, fontSize: '0.58rem', color: T.muted, marginTop: 4 }}>Since first record</div>
                        </div>
                        <div style={{ background: T.faint, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <BeakerIcon style={{ width: 14, color: T.green }} />
                                <span style={{ fontFamily: T.mono, fontSize: '0.55rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Last Recorded</span>
                            </div>
                            <div style={{ fontFamily: T.disp, fontSize: '1.8rem', color: T.hi }}>
                                {new Date(measurements[measurements.length - 1].measuredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div style={{ fontFamily: T.mono, fontSize: '0.58rem', color: T.muted, marginTop: 4 }}>Date of latest assessment</div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
