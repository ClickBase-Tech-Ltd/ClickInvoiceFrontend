"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useEffect, useState } from "react";
import api from "../../../lib/api";

// Color palette for slices
const COLORS = ["#0A66C2", "#FF8C00", "#00C49F", "#FF8042", "#8A2BE2", "#DC143C", "#FF1493"];

export default function CurrencyDistributionChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/admin/currency-distribution").then(res => {
      setData(res.data);
    });
  }, []);

  return (
    <div className="card">
      <h3 className="font-semibold mb-2">Currency Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="currency"
            innerRadius={60}
            outerRadius={90}
            label={(entry) => `${entry.currency}: ${entry.total.toLocaleString()}`} // show currency + total
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
