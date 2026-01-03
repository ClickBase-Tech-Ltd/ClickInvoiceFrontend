"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
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
    <div className="card">
      <h3 className="font-semibold mb-2">Revenue Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" /> {/* optional grid lines */}
          <XAxis dataKey="period" />
          <YAxis 
            tickFormatter={(value) => value.toLocaleString()} // format Y-axis numbers
          />
          <Tooltip 
            formatter={(value: number) => value.toLocaleString()} // format tooltip numbers
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#0A66C2" // line color
            strokeWidth={3}
            dot={{ r: 5, fill: "#0A66C2" }} // show dots
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
