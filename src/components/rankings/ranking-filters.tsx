"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/common/select';
import { Button } from '@/ui/common/button';
import { Calendar, Clock, TrendingUp, Compass, Map, Route, Anchor } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/utils';

interface RankingFiltersProps {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  currentType: string;
}

// 时间范围选项 - 航海时间线
const timeRangeOptions = [
  { value: 'all', labelKey: 'filters.time_range.all_time', icon: Compass },
  { value: 'today', labelKey: 'filters.time_range.today', icon: Clock },
  { value: 'week', labelKey: 'filters.time_range.this_week', icon: Calendar },
  { value: 'month', labelKey: 'filters.time_range.this_month', icon: Calendar },
  { value: 'quarter', labelKey: 'filters.time_range.this_quarter', icon: TrendingUp },
  { value: 'year', labelKey: 'filters.time_range.this_year', icon: Route }
];

export default function RankingFilters({
  timeRange,
  onTimeRangeChange,
  categoryFilter,
  onCategoryChange,
  categories,
  currentType
}: RankingFiltersProps) {
  const tRank = useTranslations('pages.rankings');
  const currentTimeRange = timeRangeOptions.find(option => option.value === timeRange);

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center flex-wrap">
      {/* 时间范围过滤器 - 航海时线 */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Calendar className="h-4 w-4 text-primary professional-compass" />
        </div>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className={cn(
            "w-auto min-w-[10rem] max-w-[14rem] h-10 rounded-xl",
            "border-primary/20 focus:border-primary bg-background/80"
          )}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="h-3 w-3" />
                  {tRank(option.labelKey)}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 领域过滤器 - 地图区域 */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-magellan-teal/10">
          <Map className="h-4 w-4 text-magellan-teal professional-float" />
        </div>
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className={cn(
            "w-auto min-w-[10rem] max-w-[14rem] h-10 rounded-xl",
            "border-primary/20 focus:border-primary bg-background/80"
          )}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">🌊 {tRank('filters.category_all')}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-magellan-teal"></div>
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 快速时间范围按钮 - 航海速建 */}
      <div className="flex gap-3">
        {(['week', 'month', 'quarter'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimeRangeChange(range)}
            className={cn(
              "text-xs px-3 py-2 rounded-lg transition-all duration-300",
              timeRange === range 
                ? "bg-primary text-white shadow-lg" 
                : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
            )}
          >
            <Route className="h-3 w-3 mr-1 professional-compass" />
            {tRank(`filters.quick_ranges.${range}`)}
          </Button>
        ))}
      </div>

      {/* 重置航海过滤器 */}
      {(timeRange !== 'all' || categoryFilter !== 'all') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onTimeRangeChange('all');
            onCategoryChange('all');
          }}
          className={cn(
            "text-xs px-4 py-2 rounded-lg",
            "bg-magellan-coral/10 hover:bg-magellan-coral/20",
            "text-magellan-coral hover:text-magellan-coral",
            "border border-magellan-coral/20 hover:border-magellan-coral/40",
            "transition-all duration-300"
          )}
        >
          <Anchor className="h-3 w-3 mr-1 professional-float" />
          ⚓ {tRank('filters.reset')}
        </Button>
      )}
    </div>
  );
}
