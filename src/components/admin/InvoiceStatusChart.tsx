"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useEffect, useState } from "react";
import api from "../../../lib/api";

// Define colors for slices
const COLORS = ["#0A66C2", "#FF8C00", "#00C49F", "#FF8042", "#8A2BE2", "#DC143C"];

export default function InvoiceStatusChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/admin/invoice-status-breakdown").then(res => {
      setData(res.data);
    });
  }, []);

  return (
    <div className="card">
      <h3 className="font-semibold mb-2">Invoice Status</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            innerRadius={60}
            outerRadius={90}
            label={(entry) => entry.status} // show status on slice
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
