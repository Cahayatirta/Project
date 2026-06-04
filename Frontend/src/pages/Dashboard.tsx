import { useMemo, useState } from "react";
import Calendar, { type CalendarEvent } from "../components/Calendar";
import PieChart from "../components/PieChart";
import AddActivity from "../components/AddActivity";
import { useLoaderData } from "react-router";
import type { DashboardData, LoaderData } from "../utils/types";
import { createDateFromRawDate, formatDate } from "../utils/util";
import DetailActivity from "../components/dashboard/DetailActivity";

const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

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

export default function Dashboard() {
  const [openNewActivity, setOpenNewActivity] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [activeDate, setActiveDate] = useState<Date>()

  const { data } = useLoaderData() as LoaderData<DashboardData>
  const { histories } = data
  const historyCalendarEvents = useMemo(() => createHistoryCalendarEvents(histories), [histories]);
  const activeRecord = useMemo(() => {
    if (activeDate) {
      return histories.find((history) => history.dateRaw == formatDate(activeDate))
    }
    return undefined;
  }, [activeDate, histories]);
  
  return (
    <>
      <main className="bg-background px-4 py-6 font-poppins sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-md bg-white p-8 shadow-md">
            <PieChart data={data.summary} />
          </div>
          <div className="rounded-md bg-white shadow-md p-8 relevant-attributes">
          </div>
          <div className="rounded-md bg-white shadow-md p-8" />
        </section>
        <section>
            <Calendar
            addActivity={(date) => {
              setOpenNewActivity(true)
              setActiveDate(date)
            }}
            events={historyCalendarEvents}
            monthUpdated={(newMonth) => console.log(newMonth)}
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
