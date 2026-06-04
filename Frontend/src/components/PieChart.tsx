import {
  ArcElement,
  Chart as ChartJS,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type Plugin,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { DashboardData } from "../utils/types";

ChartJS.register(ArcElement, Tooltip);


export default function PieChart({ data }: { data: DashboardData["summary"] }) {
  const chartData: ChartData<"doughnut"> = {
    labels: ["Relaxed", "Normal", "Exhausted"],
    datasets: [
      {
        data: [data['Relaxed'], data['Normal'], data['Exhausted']],
        backgroundColor: ["#d5f6eb", "#ffe3d0", "#ffc4c8"],
        borderColor: "#ffffff",
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };
  
  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "74%",
    plugins: {
      tooltip: {
        enabled: true,
      },
    },
  };
  
  const centerTextPlugin: Plugin<"doughnut"> = {
    id: "centerText",
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      const x = (chartArea.left + chartArea.right) / 2;
      const y = (chartArea.top + chartArea.bottom) / 2;
  
      ctx.save();
      ctx.fillStyle = "#1f2937";
      ctx.font = "600 16px Poppins, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Fill text with max stress level
      const maxStress = Object.values(data).reduce((max, current) => Math.max(max, current), 0);
      ctx.fillText(maxStress === data['Relaxed'] ? "Relaxed" : maxStress === data['Normal'] ? "Normal" : "Exhausted", x, y);
      ctx.restore();
    },
  };
  
  const legends = [
    { label: "Relaxed", color: "bg-[#d5f6eb]" },
    { label: "Normal", color: "bg-[#ffe3d0]" },
    { label: "Exhausted", color: "bg-[#ffc4c8]" },
  ];
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        {legends.map((legend) => (
          <div key={legend.label} className="flex items-center gap-2 text-sm text-slate-600">
            <span className={`h-3 w-3 rounded-full ${legend.color}`} />
            <span>{legend.label}</span>
          </div>
        ))}
      </div>

      <div className="h-36 w-36">
        <Doughnut data={chartData} options={chartOptions} plugins={[centerTextPlugin]} />
      </div>
    </div>
  )
}
