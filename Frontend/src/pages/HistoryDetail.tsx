import { Link, useLoaderData } from "react-router";
import type { Histories, LoaderData } from "../utils/types";
import AverageCard from "../components/history/AverageCard";
import ActivityCard from "../components/history/ActivityCard";
import PageHeadline from "../components/PageHeadline";
import { FaArrowLeft } from "react-icons/fa6";

export default function HistoryDetail() {
  const { data: histories } = useLoaderData() as LoaderData<Histories>;

  return (
    <div className="container max-w-4xl mx-auto mt-8 px-4">
      <Link to="/history" className="inline-flex gap-4 items-center text-slate-600 mb-4 border-b border-transparent hover:border-slate-600">
        <FaArrowLeft />
        Back to monthly history
      </Link>
      <div className="flex justify-between items-center gap-6">
        <div>
          <PageHeadline page="History" title={`History in ${histories.month}`} />
        </div>
        {/* Input Search & Filter */}
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {histories.summary.map((average, i) => (
          <AverageCard key={i} attribute={average.label} value={average.value} />
        ))}
      </div>
      <div className="histories mt-8 flex flex-col gap-4">
        {histories.history.map((history) => (
          <ActivityCard history={history} />
        ))}
      </div>
    </div>
  );
}
