"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/common/select';
import { Button } from '@/ui/common/button';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

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
  { value: 'all', label: 'All Time', icon: Clock },
  { value: 'today', label: 'Today', icon: Clock },
  { value: 'week', label: 'This Week', icon: Calendar },
  { value: 'month', label: 'This Month', icon: Calendar },
  { value: 'quarter', label: 'This Quarter', icon: TrendingUp },
  { value: 'year', label: 'This Year', icon: TrendingUp }
];

export default function RankingFilters({
  timeRange,
  onTimeRangeChange,
  categoryFilter,
  onCategoryChange,
  categories,
  currentType
}: RankingFiltersProps) {
  const currentTimeRange = timeRangeOptions.find(option => option.value === timeRange);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      {/* Time Range Filter */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
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
        {['week', 'month', 'quarter'].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimeRangeChange(range)}
            className="text-xs"
          >
            {range === 'week' ? '7D' : range === 'month' ? '30D' : '3M'}
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
          Reset
        </Button>
      )}
    </div>
  );
}