"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { useEffect, useState } from "react";
import api from "../../../lib/api";

// Premium color palette
const COLORS = [
  "#0A66C2", // LinkedIn Blue
  "#10B981", // Emerald Green
  "#F59E0B", // Amber
  "#DC2626", // Crimson
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
];

export default function InvoiceStatusChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/admin/invoice-status-breakdown").then(res => {
      setData(res.data);
    });
  }, []);

  return (
    <div className="glass-card rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Invoice Status
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={4}
            labelLine={false}
            label={({ status, count }) => `${status}: ${count.toLocaleString()}`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "1px solid #E5E7EB",
            }}
            formatter={(value: number) => value.toLocaleString()}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ fontSize: "13px", fontWeight: 500 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
