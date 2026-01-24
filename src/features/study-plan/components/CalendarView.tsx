'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface CalendarViewProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    taskDates?: Date[]; // Dates that have tasks
    className?: string;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

export function CalendarView({ selectedDate, onDateSelect, taskDates = [], className }: CalendarViewProps) {
    const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days: (Date | null)[] = [];

        // Add empty slots for days before the first day of month
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const hasTask = (date: Date) => {
        return taskDates.some(d =>
            d.getDate() === date.getDate() &&
            d.getMonth() === date.getMonth() &&
            d.getFullYear() === date.getFullYear()
        );
    };

    const isSelected = (date: Date) => {
        return date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev);
            newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
            return newMonth;
        });
    };

    const jumpToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        onDateSelect(today);
    };

    const days = getDaysInMonth(currentMonth);

    return (
        <div className={cn(
            "rounded-3xl bg-white/70 backdrop-blur-xl border border-neutral-200/60 p-6 shadow-xl shadow-neutral-900/5",
            className
        )}>
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-1 rounded-xl bg-neutral-100/80 p-1">
                    <button
                        onClick={() => setViewMode('monthly')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                            viewMode === 'monthly'
                                ? "bg-white text-neutral-900 shadow-md"
                                : "text-neutral-500 hover:text-neutral-700"
                        )}
                    >
                        Monthly View
                    </button>
                    <button
                        onClick={() => setViewMode('weekly')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                            viewMode === 'weekly'
                                ? "bg-white text-neutral-900 shadow-md"
                                : "text-neutral-500 hover:text-neutral-700"
                        )}
                    >
                        Weekly View
                    </button>
                </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-neutral-900">
                        {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <div className="flex gap-1">
                        <button
                            onClick={() => navigateMonth('prev')}
                            className="p-2 rounded-xl hover:bg-neutral-100 transition-all duration-200 hover:scale-110"
                        >
                            <ChevronLeft className="h-5 w-5 text-neutral-500" />
                        </button>
                        <button
                            onClick={() => navigateMonth('next')}
                            className="p-2 rounded-xl hover:bg-neutral-100 transition-all duration-200 hover:scale-110"
                        >
                            <ChevronRight className="h-5 w-5 text-neutral-500" />
                        </button>
                    </div>
                </div>
                <button
                    onClick={jumpToToday}
                    className="text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                >
                    Jump to Today
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {DAYS.map(day => (
                    <div key={day} className="py-3 text-center text-xs font-bold text-neutral-400">
                        {day}
                    </div>
                ))}

                {/* Date Cells */}
                {days.map((date, index) => (
                    <div key={index} className="aspect-square p-1">
                        {date && (
                            <button
                                onClick={() => onDateSelect(date)}
                                className={cn(
                                    "w-full h-full flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all duration-300 relative",
                                    isSelected(date)
                                        ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-violet-500/30 scale-105"
                                        : isToday(date)
                                            ? "bg-gradient-to-br from-[#00bae2]/20 to-[#fec5fb]/20 text-[#00889e] hover:shadow-md"
                                            : "text-neutral-700 hover:bg-neutral-100 hover:scale-105"
                                )}
                            >
                                {date.getDate()}
                                {hasTask(date) && !isSelected(date) && (
                                    <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-violet-500" />
                                )}
                                {hasTask(date) && isSelected(date) && (
                                    <div className="absolute bottom-1.5 flex gap-0.5">
                                        <div className="w-1 h-1 rounded-full bg-white/80" />
                                        <div className="w-1 h-1 rounded-full bg-white/80" />
                                    </div>
                                )}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
