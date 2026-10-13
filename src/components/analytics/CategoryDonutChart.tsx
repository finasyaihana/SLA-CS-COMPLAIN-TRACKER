import React, { useState } from 'react';
import { CategoryPerformanceItem } from '../../utils/analytics';
import { PieChart } from 'lucide-react';

interface Props {
  data: CategoryPerformanceItem[];
  onSelectCategory?: (categoryKey: string) => void;
}

export const CategoryDonutChart: React.FC<Props> = ({ data, onSelectCategory }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const totalComplaints = data.reduce((acc, curr) => acc + curr.total, 0);

  if (totalComplaints === 0) {
    return null;
  }

  // Filter only categories with > 0 items
  const activeItems = data.filter(d => d.total > 0);

  // Calculate SVG donut paths
  const radius = 80;
  const strokeWidth = 32;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const slices = activeItems.map(item => {
    const percent = item.total / totalComplaints;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -(accumulatedPercent * circumference);
    accumulatedPercent += percent;

    return {
      ...item,
      percent,
      strokeDasharray,
      strokeDashoffset
    };
  });

  const activeCategory = hoveredKey
    ? activeItems.find(i => i.key === hoveredKey)
    : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-5 h-5 text-teal-600" />
        <h3 className="text-base font-semibold text-slate-900">
          Proporsi Kategori Komplain
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Donut SVG */}
        <div className="md:col-span-5 flex justify-center relative">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            {slices.map(slice => {
              const isHovered = hoveredKey === slice.key;
              return (
                <circle
                  key={slice.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={slice.accentColor}
                  strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredKey(slice.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => onSelectCategory && onSelectCategory(slice.key)}
                />
              );
            })}
          </svg>

          {/* Center text in donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeCategory ? (
              <>
                <span className="text-xl font-bold text-slate-900 tabular-nums">
                  {activeCategory.total}
                </span>
                <span className="text-[11px] text-slate-500 max-w-[100px] truncate">
                  {activeCategory.shortLabel}
                </span>
                <span className="text-[10px] text-blue-600 font-semibold tabular-nums">
                  {Math.round((activeCategory.total / totalComplaints) * 100)}%
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {totalComplaints}
                </span>
                <span className="text-[11px] text-slate-500">Total Komplain</span>
              </>
            )}
          </div>
        </div>

        {/* Legend list */}
        <div className="md:col-span-7 space-y-1.5 max-h-[220px] overflow-y-auto pr-2">
          {activeItems.map(item => {
            const isHovered = hoveredKey === item.key;
            return (
              <div
                key={item.key}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={() => onSelectCategory && onSelectCategory(item.key)}
                className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  isHovered ? 'bg-slate-100' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.accentColor }}
                  />
                  <span className="truncate text-slate-700 font-medium">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {item.total}
                  </span>
                  <span className="text-slate-400 tabular-nums w-8 text-right font-mono">
                    {Math.round((item.total / totalComplaints) * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
