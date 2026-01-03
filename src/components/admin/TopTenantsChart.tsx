"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { useEffect, useState } from "react";
import api from "../../../lib/api";

// Color palette for bars
const COLORS = ["#0A66C2", "#FF8C00", "#00C49F", "#FF8042", "#8A2BE2", "#DC143C", "#FF1493"];

export default function TopTenantsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/admin/top-tenants").then(res => {
      setData(res.data);
    });
  }, []);

  return (
    <div className="card">
      <h3 className="font-semibold mb-2">Top Tenants</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(value) => value.toLocaleString()} />
          <YAxis dataKey="tenantName" type="category" width={150} />
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Bar dataKey="revenue">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
