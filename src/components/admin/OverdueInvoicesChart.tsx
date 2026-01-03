"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import api from "../../../lib/api";

export default function OverdueInvoicesChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/admin/overdue-invoices-summary").then(res => {
      const formatted = [
        { period: "1–7 days", count: res.data["1_7_days"] },
        { period: "8–30 days", count: res.data["8_30_days"] },
        { period: "31+ days", count: res.data["31_plus_days"] },
      ];
      setData(formatted);
    });
  }, []);

  return (
    <div className="card">
      <h3>Overdue Invoices</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
