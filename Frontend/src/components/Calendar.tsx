import { useMemo, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaPlus } from "react-icons/fa6";
import Button from "./Button";
import type { Stress } from "../utils/types";


export type CalendarEvent = {
  id: number;
  title: Stress;
  start: Date;
  end: Date;
};

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
};

const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const statusStyles: Record<Stress, string> = {
  Relaxed: "bg-emerald-100 text-emerald-700",
  Normal: "bg-yellow-100 text-yellow-700",
  Exhausted: "bg-rose-100 text-rose-700",
  "No Activity": "bg-slate-100 text-slate-600",
};

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function isSameDate(firstDate: Date, secondDate: Date) {
  return toDateKey(firstDate) === toDateKey(secondDate);
}

function isDateBetween(date: Date, start: Date, end: Date) {
  const currentTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

  return currentTime >= startTime && currentTime <= endTime;
}

function createCalendarDays(monthDate: Date, events: CalendarEvent[]): CalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDate = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDate.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      isCurrentMonth: date.getMonth() === month,
      events: events.filter((event) => isDateBetween(date, event.start, event.end)),
    };
  });
}

type CalendarProps = {
  addActivity: (date?: Date) => void,
  monthUpdated: (newMonth: Date) => void,
  viewDay: (date: Date) => void,
  events: CalendarEvent[],
}

export default function Calendar({ addActivity, monthUpdated, events, viewDay }: CalendarProps) {
  const [activeMonth, setActiveMonth] = useState(() => new Date());

  const calendarDays = useMemo(() => createCalendarDays(activeMonth, events), [activeMonth, events]);

  const monthLabel = activeMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function changeMonth(monthOffset: number) {
    monthUpdated(new Date(activeMonth.getFullYear(), activeMonth.getMonth() + monthOffset , 1))
    setActiveMonth((currentMonth) => {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(currentMonth.getMonth() + monthOffset);
      return nextMonth;
    });
  }

  function handleDateClick(date: Date, isCurrentMonth: boolean, events: CalendarEvent[]) {    
    if (!isCurrentMonth) {
      setActiveMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      monthUpdated(new Date(date.getFullYear(), date.getMonth(), 1))
      return;
    }
    if (events.length) {
      viewDay(date)
    } else {
      addActivity(date)
    }
  }

  return (
    <section className="overflow-auto md:overflow-hidden w-full rounded-md border border-slate-200 bg-white font-poppins shadow-sm">
      <div className="flex items-center gap-5 border-b border-slate-200 px-6 py-4 w-fit">
        <Button
          type="button"
          className="text-xs!"
          onClick={() => addActivity()}
        >
          <FaPlus className="text-sm" />
          <span>Add Activity</span>
        </Button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-slate-700 transition-colors hover:text-primary-700"
            aria-label="Previous month"
            onClick={() => changeMonth(-1)}
          >
            <FaArrowLeft />
          </button>
          <button
            type="button"
            className="text-slate-700 transition-colors hover:text-primary-700"
            aria-label="Next month"
            onClick={() => changeMonth(1)}
          >
            <FaArrowRight />
          </button>
          <h2 className="text-base font-medium text-slate-950">{monthLabel}</h2>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(7,minmax(120px,1fr))] border-b border-slate-300 bg-slate-100 w-fit md:w-full">
        {dayLabels.map((day) => (
          <div
            key={day}
            className="border-r border-slate-300 px-2 py-2 text-center text-sm font-medium text-slate-950 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(7,minmax(120px,1fr))] w-fit md:w-full">
        {calendarDays.map((day) => (
          <button
            type="button"
            key={toDateKey(day.date)}
            className="min-h-24 border-r border-b border-slate-200 bg-white px-1.5 py-2 text-left transition-colors hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400 nth-[7n]:border-r-0"
            onClick={() => handleDateClick(day.date, day.isCurrentMonth, day.events)}
          >
            <span
              className={`block text-center text-sm ${
                day.isCurrentMonth ? "text-slate-950" : "text-slate-300"
              }`}
            >
              {day.date.getDate()}
            </span>

            <div className="mt-4 space-y-1">
              {day.events.map((event) => {
                const showTitle = isSameDate(day.date, event.start) || day.date.getDay() === 0;

                return (
                  <div
                    key={event.id}
                    className={`h-6 rounded-sm px-2 py-1 text-left text-xs font-medium ${statusStyles[event.title]}`}
                  >
                    {showTitle ? event.title : ""}
                  </div>
                );
              })}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
