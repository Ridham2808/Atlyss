import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const StatCard = ({ title, value, icon: Icon, color = 'red', trend, subtitle }) => {
    const colorMap = {
        red: { bg: 'bg-red-900/20', border: 'border-red-900/30', icon: 'text-red-400', glow: 'shadow-red-900/20' },
        orange: { bg: 'bg-orange-900/20', border: 'border-orange-900/30', icon: 'text-orange-400', glow: 'shadow-orange-900/20' },
        green: { bg: 'bg-green-900/20', border: 'border-green-900/30', icon: 'text-green-400', glow: 'shadow-green-900/20' },
        blue: { bg: 'bg-blue-900/20', border: 'border-blue-900/30', icon: 'text-blue-400', glow: 'shadow-blue-900/20' },
        purple: { bg: 'bg-purple-900/20', border: 'border-purple-900/30', icon: 'text-purple-400', glow: 'shadow-purple-900/20' },
    };
    const c = colorMap[color] || colorMap.red;

    return (
        <div className={`bg-[#111] border ${c.border} rounded-2xl p-5 flex items-start gap-4 shadow-lg ${c.glow} hover:scale-[1.02] transition-transform duration-200`}>
            <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                {Icon && <Icon className={`w-6 h-6 ${c.icon}`} />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-gray-500 text-sm font-medium truncate">{title}</p>
                <p className="text-3xl font-bold text-white mt-0.5">{value ?? '—'}</p>
                {(trend !== undefined || subtitle) && (
                    <div className="flex items-center gap-1 mt-1">
                        {trend !== undefined && (
                            <>
                                {trend >= 0
                                    ? <ArrowUpIcon className="w-3 h-3 text-green-400" />
                                    : <ArrowDownIcon className="w-3 h-3 text-red-400" />
                                }
                                <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {Math.abs(trend)}%
                                </span>
                            </>
                        )}
                        {subtitle && <span className="text-xs text-gray-600">{subtitle}</span>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
