import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface VitalCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export function VitalCard({ title, value, icon: Icon, trend, color = 'blue' }: VitalCardProps) {
  const colorMap: Record<string, { grad: string; shadow: string }> = {
    blue: { grad: 'from-blue-500 to-blue-600',   shadow: 'shadow-blue-100' },
    teal: { grad: 'from-teal-500 to-teal-600',   shadow: 'shadow-teal-100' },
    cyan: { grad: 'from-cyan-500 to-cyan-600',   shadow: 'shadow-cyan-100' },
    rose: { grad: 'from-rose-500 to-rose-600',   shadow: 'shadow-rose-100' },
  };

  const c = colorMap[color] ?? colorMap.blue;

  const isPositive = trend?.startsWith('+');
  const isNegative = trend?.startsWith('-');
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-md ${c.shadow} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-gray-50`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center shadow-sm`}>
          <Icon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
            isPositive ? 'bg-green-50 text-green-700' : isNegative ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'
          }`}>
            <TrendIcon className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}