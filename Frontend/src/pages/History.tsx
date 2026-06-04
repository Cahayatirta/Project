// import AverageCard from "../components/history/AverageCard";
import { useLoaderData } from "react-router";
import PageHeadline from "../components/PageHeadline";
import MonthCard from "../components/history/MonthCard";
import type { MonthData } from "../utils/types";

export default function History() {
  const { data: histories } = useLoaderData() as { data: MonthData[]};
  return (
    <div className="container max-w-4xl mx-auto mt-8 px-4">
      <div className="flex justify-between items-center gap-6">
        <PageHeadline page="History" />
        {/* Input Search & Filter */}
      </div>
      {/* <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {histories.summary.map((average, i) => (
          <AverageCard key={i} attribute={average.label} value={average.value} />
        ))}
      </div> */}
      <div className="histories mt-8 flex flex-col gap-4">
        {histories.map((month, i) => (
          <MonthCard key={i} monthData={month} detailPath={`/history/${month.monthPath}`} />
        ))}
      </div>
    </div>
  );
}