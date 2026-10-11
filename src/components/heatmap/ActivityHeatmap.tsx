import React, { useState, useEffect, useRef } from 'react';
import { HeatmapData, ActivityDay } from '../../types';
import { api } from '../../api/client';

interface ActivityHeatmapProps {
  title?: string;
  subtitle?: string;
  userId?: string;
  showPeriodControls?: boolean;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', ''];

// Five intensity level colors from BrandWaves palette
const INTENSITY_COLORS = [
  '#ebedf0', // Level 0: No activity
  '#DBE2EF', // Level 1: Pale secondary surface tint
  '#8EAAFB', // Level 2: Mid-tone blue
  '#3F72AF', // Level 3: Brand Primary Blue
  '#112D4E', // Level 4: Brand Deep Navy
];

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  title = 'Activity Overview',
  subtitle = 'Your activity and consistency over time.',
  userId,
  showPeriodControls = true,
}) => {
  const [period, setPeriod] = useState<number>(365);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    date: string;
    count: number;
    x: number;
    y: number;
  }>({
    visible: false,
    date: '',
    count: 0,
    x: 0,
    y: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getHeatmap(period, userId)
      .then((data) => {
        if (isMounted) {
          setHeatmap(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load heatmap:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [period, userId]);

  // Group the 364 days into 52 columns of 7 days
  const columns: ActivityDay[][] = [];
  if (heatmap?.days) {
    for (let c = 0; c < 52; c++) {
      columns.push(heatmap.days.slice(c * 7, (c + 1) * 7));
    }
  }

  const handleCellHover = (
    e: React.MouseEvent<HTMLDivElement> | React.FocusEvent<HTMLDivElement>,
    dateStr: string,
    count: number
  ) => {
    if (!containerRef.current) return;
    const parentRect = containerRef.current.getBoundingClientRect();
    const cellRect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    const x = cellRect.left - parentRect.left + cellRect.width / 2;
    const y = cellRect.top - parentRect.top - 8;

    // Format date string nicely: YYYY-MM-DD -> Month Day, Year
    const dateObj = new Date(dateStr + 'T00:00:00');
    const formatted = `${MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;

    setTooltip({
      visible: true,
      date: formatted,
      count,
      x,
      y,
    });
  };

  const handleCellLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const periodLabel = () => {
    if (period === 30) return 'activities in the last 30 days';
    if (period === 90) return 'activities in the last 90 days';
    if (period === 180) return 'activities in the last 6 months';
    return 'activities in the last year';
  };

  // Determine cutoff column for inactive opacity when period < 365
  const activeWeeksCount = Math.ceil(period / 7);
  const cutoffColumn = 52 - activeWeeksCount;

  return (
    <section aria-labelledby="activity-overview-heading" className="w-full">
      <div 
        ref={containerRef}
        className="relative flex flex-col rounded-xl border border-brand-surface bg-surface-container-lowest p-5 sm:p-6 shadow-subtle transition-all"
      >
        {/* Floating Tooltip */}
        {tooltip.visible && (
          <div
            className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full rounded-md bg-brand-navy px-2.5 py-1.5 text-xs font-medium text-white shadow-lg transition-all duration-75"
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          >
            <div className="whitespace-nowrap">
              {tooltip.date} — {tooltip.count} {tooltip.count === 1 ? 'activity' : 'activities'}
            </div>
            <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-brand-navy"></div>
          </div>
        )}

        {/* Header & Range Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-brand-surface/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-blue inline-block"></span>
              <h2
                id="activity-overview-heading"
                className="text-brand-navy text-lg font-bold leading-tight tracking-tight"
              >
                {title}
              </h2>
            </div>
            <p className="text-secondary text-xs font-normal mt-0.5">
              {subtitle}
            </p>
          </div>

          {showPeriodControls && (
            <div
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1"
              role="tablist"
              aria-label="Activity period selector"
            >
              {[
                { days: 30, label: 'Last 30 days' },
                { days: 90, label: 'Last 90 days' },
                { days: 180, label: 'Last 6 months' },
                { days: 365, label: 'Last 12 months' },
              ].map((item) => (
                <button
                  key={item.days}
                  type="button"
                  role="tab"
                  aria-selected={period === item.days}
                  onClick={() => setPeriod(item.days)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    period === item.days
                      ? 'bg-brand-blue text-white font-semibold shadow-sm'
                      : 'text-secondary hover:text-brand-navy hover:bg-brand-surface/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Headline Stat & Metrics Strip */}
        <div className="flex flex-wrap items-baseline justify-between gap-3 pt-4 pb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-navy">
              {loading ? '...' : heatmap ? heatmap.totalActivities.toLocaleString() : '0'}
            </span>
            <span className="text-sm font-medium text-secondary">
              {periodLabel()}
            </span>
          </div>

          {heatmap && (
            <div className="flex items-center gap-4 text-xs font-medium text-secondary">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                Longest streak: <strong className="text-brand-navy">{heatmap.longestStreak} days</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                Current streak: <strong className="text-brand-navy">{heatmap.currentStreak} days</strong>
              </span>
            </div>
          )}
        </div>

        {/* Horizontally Scrollable Heatmap Board */}
        <div className="relative w-full pt-2">
          {loading ? (
            <div className="h-32 flex items-center justify-center text-secondary text-sm animate-pulse">
              Loading activity metrics...
            </div>
          ) : !heatmap || heatmap.days.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-secondary text-sm gap-2">
              <span className="material-symbols-outlined text-[32px] text-outline">calendar_today</span>
              <p>No activity logged for this reporting period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-3 pt-1 select-none">
              <div className="min-w-[690px] flex flex-col gap-1.5">
                {/* Month Labels across 52 columns */}
                <div className="flex pl-8 text-[11px] font-medium text-secondary justify-between pr-2">
                  {MONTH_NAMES.map((m) => (
                    <span key={m} className="w-[52px] text-left">
                      {m}
                    </span>
                  ))}
                </div>

                {/* Day Labels + 52-Column Grid */}
                <div className="flex items-start gap-2">
                  {/* Weekday Labels (Mon, Wed, Fri) */}
                  <div className="flex flex-col justify-between h-[88px] text-[10px] font-medium text-secondary pt-[6px] pb-[6px] w-6 text-right leading-none shrink-0">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>

                  {/* 52 Columns Grid (7 Days / Column) */}
                  <div
                    role="grid"
                    aria-label="Annual activity contributions calendar"
                    className="flex gap-[3px] items-center"
                  >
                    {columns.map((col, colIdx) => {
                      const isDimmed = colIdx < cutoffColumn;
                      return (
                        <div
                          key={`col-${colIdx}`}
                          className={`flex flex-col gap-[3px] transition-opacity duration-300 ${
                            isDimmed ? 'opacity-25 filter grayscale' : 'opacity-100'
                          }`}
                        >
                          {col.map((cell, rowIdx) => {
                            return (
                              <div
                                key={`${colIdx}-${rowIdx}`}
                                role="gridcell"
                                tabIndex={0}
                                aria-label={`${cell.date}: ${cell.count} activities`}
                                onMouseEnter={(e) => handleCellHover(e, cell.date, cell.count)}
                                onMouseLeave={handleCellLeave}
                                onFocus={(e) => handleCellHover(e, cell.date, cell.count)}
                                onBlur={handleCellLeave}
                                style={{ backgroundColor: INTENSITY_COLORS[cell.level] }}
                                className="w-[10.5px] h-[10.5px] rounded-[2px] cursor-pointer transition-transform duration-150 hover:scale-125 hover:z-20 hover:shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-blue"
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Heatmap Footer: Legend & Status info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-brand-surface/60 text-xs text-secondary">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="material-symbols-outlined text-[16px] text-brand-blue">insights</span>
              <span>Real-time aggregated UGC submissions, reviews, and campaign activities</span>
            </div>

            {/* 5-Level Intensity Legend */}
            <div className="flex items-center gap-1.5 text-xs text-secondary font-medium self-end sm:self-auto">
              <span>Less</span>
              <div className="flex items-center gap-[3px]">
                {INTENSITY_COLORS.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-[10px] h-[10px] rounded-[2px]"
                    style={{ backgroundColor: color }}
                    title={`Level ${idx}: ${idx === 0 ? '0' : idx === 1 ? '1-3' : idx === 2 ? '4-6' : idx === 3 ? '7-9' : '10+'} activities`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
