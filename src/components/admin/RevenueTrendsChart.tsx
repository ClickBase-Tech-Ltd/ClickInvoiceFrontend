"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useEffect, useState } from "react";
import api from "../../../lib/api";

export default function RevenueTrendsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/admin/revenue-trends").then(res => {
      setData(res.data);
    });
  }, []);

  return (
    <div className="glass-card rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Revenue Trends
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis
            dataKey="period"
            tick={{ fill: "#6B7280", fontSize: 12 }}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            tickFormatter={(value) => `₦${value.toLocaleString()}`}
            tick={{ fill: "#6B7280", fontSize: 12 }}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "1px solid #E5E7EB",
            }}
            formatter={(value: number) => `₦${value.toLocaleString()}`}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: "13px", fontWeight: 500 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#0A66C2"
            strokeWidth={3}
            dot={{ r: 5, fill: "#0A66C2", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 7, stroke: "#0A66C2", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
