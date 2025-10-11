"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/common/select';
import { Button } from '@/ui/common/button';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

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

const timeRangeOptions = [
  { value: 'all', labelKey: 'filters.time_range.all_time', icon: Clock },
  { value: 'today', labelKey: 'filters.time_range.today', icon: Clock },
  { value: 'week', labelKey: 'filters.time_range.this_week', icon: Calendar },
  { value: 'month', labelKey: 'filters.time_range.this_month', icon: Calendar },
  { value: 'quarter', labelKey: 'filters.time_range.this_quarter', icon: TrendingUp },
  { value: 'year', labelKey: 'filters.time_range.this_year', icon: TrendingUp }
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
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      {/* Time Range Filter */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-auto min-w-[8rem] max-w-[12rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <option.icon className="h-4 w-4" />
                {tRank(option.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-auto min-w-[8rem] max-w-[12rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tRank('filters.category_all')}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Time Range Buttons */}
      <div className="flex gap-2">
        {(['week', 'month', 'quarter'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimeRangeChange(range)}
            className="text-xs"
          >
            {tRank(`filters.quick_ranges.${range}`)}
          </Button>
        ))}
      </div>

      {/* Reset Filters */}
      {(timeRange !== 'all' || categoryFilter !== 'all') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onTimeRangeChange('all');
            onCategoryChange('all');
          }}
          className="text-xs"
        >
          {tRank('filters.reset')}
        </Button>
      )}
    </div>
  );
}
