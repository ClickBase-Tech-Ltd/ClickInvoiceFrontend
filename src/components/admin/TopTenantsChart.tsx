"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend } from "recharts";
import { useEffect, useState } from "react";
import api from "../../../lib/api";

// Premium color palette
const COLORS = [
  "#0A66C2", // LinkedIn Blue
  "#10B981", // Emerald Green
  "#6366F1", // Indigo
  "#F59E0B", // Amber
  "#DC2626", // Crimson
  "#8B5CF6", // Violet
  "#14B8A6", // Teal
];

export default function TopTenantsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/admin/top-tenants").then(res => {
      setData(res.data);
    });
  }, []);

  return (
    <div className="glass-card rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Top Tenants
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis
            type="number"
            tickFormatter={(value) => `₦${value.toLocaleString()}`}
            tick={{ fill: "#6B7280", fontSize: 12 }}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            dataKey="tenantName"
            type="category"
            width={150}
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
          <Bar dataKey="revenue" radius={[6, 6, 6, 6]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
