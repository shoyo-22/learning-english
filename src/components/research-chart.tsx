"use client";
import { useLocale } from "@/lib/i18n/provider";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { SkillResult } from "@/lib/types";
export default function ResearchChart({ data }: { data: SkillResult[] }) {
  const { tr, number } = useLocale();

  return (
    <div
      className="chart-wrap"
      role="img"
      aria-label={tr(
        "Grouped bar chart comparing Before and After assessment percentages. Exact values appear in the table below.",
      )}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart
          data={data.map((item) => ({ ...item, skill: tr(item.skill) }))}
          margin={{ top: 16, right: 8, left: -20, bottom: 8 }}
          barGap={7}
        >
          <CartesianGrid
            strokeDasharray="3 4"
            vertical={false}
            stroke="#e8eee5"
          />
          <XAxis
            dataKey="skill"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#7c8879", fontSize: 10 }}
            interval={0}
          />
          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8b9886", fontSize: 10 }}
            tickFormatter={(v) => `${number(Number(v))}%`}
          />
          <Tooltip
            cursor={{ fill: "#f4f7f0" }}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e0e8db",
              fontSize: 12,
            }}
            formatter={(v) => `${number(Number(v))}%`}
          />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 10, paddingTop: 20 }}
          />
          <Bar
            dataKey="before"
            name={tr("Before practice")}
            fill="#cbdac2"
            radius={[5, 5, 0, 0]}
            maxBarSize={44}
            isAnimationActive={false}
          />
          <Bar
            dataKey="after"
            name={tr("After practice")}
            fill="#27795c"
            radius={[5, 5, 0, 0]}
            maxBarSize={44}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
