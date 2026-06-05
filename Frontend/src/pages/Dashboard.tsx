import { useMemo, useState } from "react";
import Calendar, { type CalendarEvent } from "../components/Calendar";
import PieChart from "../components/PieChart";
import AddActivity from "../components/AddActivity";
import { useLoaderData } from "react-router";
import type { ApiResponse, DashboardData, LoaderData } from "../utils/types";
import { createDateFromRawDate, formatDate } from "../utils/util";
import DetailActivity from "../components/dashboard/DetailActivity";
import api from "../utils/api";
import { FaCalendarCheck, FaChartLine, FaFire } from "react-icons/fa6";
import { FaExclamationTriangle } from "react-icons/fa";

const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
const trackedStressStatuses = ["Exhausted"] as const;

const stressStatusStyles = {
  // Relaxed: {
  //   bar: "bg-emerald-400",
  //   text: "text-emerald-700",
  //   bg: "bg-emerald-50",
  // },
  // Normal: {
  //   bar: "bg-amber-400",
  //   text: "text-amber-700",
  //   bg: "bg-amber-50",
  // },
  Exhausted: {
    bar: "bg-rose-400",
    text: "text-rose-700",
    bg: "bg-rose-50",
  },
} as const;

function isNextDate(currentDate: Date, previousDate: Date) {
  return currentDate.getTime() - previousDate.getTime() === oneDayInMilliseconds;
}

function createHistoryCalendarEvents(histories: DashboardData["histories"]): CalendarEvent[] {
  const sortedHistories = [...histories].sort((firstHistory, secondHistory) => {
    return createDateFromRawDate(firstHistory.dateRaw).getTime() - createDateFromRawDate(secondHistory.dateRaw).getTime();
  });

  return sortedHistories.reduce<CalendarEvent[]>((events, history) => {
    const historyDate = createDateFromRawDate(history.dateRaw);
    const lastEvent = events.at(-1);

    if (lastEvent && lastEvent.title === history.stressStatus && isNextDate(historyDate, lastEvent.end)) {
      lastEvent.end = historyDate;
      return events;
    }

    events.push({
      id: events.length + 1,
      title: history.stressStatus,
      start: historyDate,
      end: historyDate,
    });

    return events;
  }, []);
}

function countCurrentStreak(histories: DashboardData["histories"]) {
  const sortedHistoryDates = histories
    .map((history) => createDateFromRawDate(history.dateRaw))
    .sort((firstDate, secondDate) => firstDate.getTime() - secondDate.getTime());

  if (!sortedHistoryDates.length) {
    return 0;
  }

  return sortedHistoryDates.reduceRight((streak, historyDate, index) => {
    if (index === sortedHistoryDates.length - 1) {
      return 1;
    }

    return isNextDate(sortedHistoryDates[index + 1], historyDate) ? streak + 1 : streak;
  }, 0);
}

function formatDisplayDate(rawDate?: string) {
  if (!rawDate) {
    return "-";
  }

  return createDateFromRawDate(rawDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const [openNewActivity, setOpenNewActivity] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [activeDate, setActiveDate] = useState<Date>()

  const { data } = useLoaderData() as LoaderData<DashboardData>
  const [histories, setHistories] = useState(data.histories)
  const historyCalendarEvents = useMemo(() => createHistoryCalendarEvents(histories), [histories]);
  const dashboardMetrics = useMemo(() => {
    const recordedDays = histories.length;
    const averageStressLevel = recordedDays
      ? Math.round(histories.reduce((total, history) => total + history.stressLevel, 0) / recordedDays)
      : 0;
    const currentStreak = countCurrentStreak(histories);
    const latestHistory = histories
      .toSorted((firstHistory, secondHistory) => {
        return createDateFromRawDate(secondHistory.dateRaw).getTime() - createDateFromRawDate(firstHistory.dateRaw).getTime();
      })
      .at(0);
    const stressCounts = trackedStressStatuses.map((status) => {
      const value = histories.filter((history) => history.stressStatus === status).length;

      return {
        status,
        value,
        percentage: recordedDays ? Math.round((value / recordedDays) * 100) : 0,
      };
    });

    return {
      averageStressLevel,
      currentStreak,
      latestActivityDate: formatDisplayDate(latestHistory?.dateRaw),
      recordedDays,
      stressCounts,
    };
  }, [histories]);
  const activeRecord = useMemo(() => {
    if (activeDate) {
      return histories.find((history) => history.dateRaw == formatDate(activeDate))
    }
    return undefined;
  }, [activeDate, histories]);

  const monthChangedHandler = async (newMonth: Date) => {
    const startDate = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1);
    const endDate = new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0);
    const { data: response } = await api.get<ApiResponse<DashboardData>>("/dashboard", {
      params: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      },
    });

    setHistories((currentHistories) => {
      const historiesByDate = new Map(
        [...currentHistories, ...response.data.histories].map((history) => [history.dateRaw, history])
      );

      return Array.from(historiesByDate.values());
    });
  }
  
  return (
    <>
      <main className="bg-background px-4 py-6 font-poppins sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-md bg-white p-8 shadow-md">
            <PieChart data={data.summary} />
          </div>
          <div className="rounded-md bg-white p-8 shadow-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Activity Snapshot</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Recorded wellbeing</h2>
              </div>
              <span className="rounded-md bg-primary-50 p-3 text-primary-600">
                <FaChartLine />
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {/* <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <FaCalendarCheck className="text-primary-600" />
                <p className="mt-3 text-xs font-medium text-slate-500">Recorded Days</p>
                <p className="text-2xl font-semibold text-slate-950">{dashboardMetrics.recordedDays}</p>
              </div>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <FaGaugeHigh className="text-primary-600" />
                <p className="mt-3 text-xs font-medium text-slate-500">Avg Stress</p>
                <p className="text-2xl font-semibold text-slate-950">{dashboardMetrics.averageStressLevel}%</p>
              </div> */}
              <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <FaFire className="text-primary-600" />
                <p className="mt-3 text-xs font-medium text-slate-500">Current Streak</p>
                <p className="text-2xl font-semibold text-slate-950">{dashboardMetrics.currentStreak} days</p>
              </div>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <FaCalendarCheck className="text-primary-600" />
                <p className="mt-3 text-xs font-medium text-slate-500">Last Activity</p>
                <p className="text-base font-semibold text-slate-950">{dashboardMetrics.latestActivityDate}</p>
              </div>
            </div>
          </div>
          <div className="rounded-md bg-white p-8 shadow-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Burnout Alert</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Exhausted Distribution</h2>
              </div>
              <span className="rounded-md bg-primary-50 p-3 text-primary-600">
                <FaExclamationTriangle />
              </span>
            </div>

            <div className="mt-6 space-y-5">
              {dashboardMetrics.stressCounts.map((stressCount) => {
                const styles = stressStatusStyles[stressCount.status];

                return (
                  <div key={stressCount.status}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${styles.bg} ${styles.text}`}>
                        {stressCount.status}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        {stressCount.value} days
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${styles.bar}`}
                        style={{ width: `${stressCount.percentage}%` }}
                      />
                    </div>
                    <p className="mt-1 text-right text-xs font-medium text-slate-500">
                      {stressCount.percentage}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <section className="mt-6">
            <Calendar
            addActivity={(date) => {
              setOpenNewActivity(true)
              setActiveDate(date)
            }}
            events={historyCalendarEvents}
            monthUpdated={monthChangedHandler}
            viewDay={(date) => {
              setOpenDetail(true)
              setActiveDate(date)
            }} />
        </section>
      </main>
      {openNewActivity && (
        <AddActivity definedDate={activeDate} onClose={() => {
          setOpenNewActivity(false)
          setActiveDate(undefined)
        }} />
      )}
      {openDetail && (
        <DetailActivity activeRecord={activeRecord} onClose={() => {
          setOpenDetail(false)
          setActiveDate(undefined)
        }} />
      )}
    </>
  );
}
