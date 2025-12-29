"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillWave, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import api from "../../../lib/api";

interface AdminSummaryResponse {
  totalCollected: number;
  totalOutstanding: number;
}

export default function AdminOutstandingAndCollected({
  currency,
}: {
  currency: string;
}) {
  const [data, setData] = useState<AdminSummaryResponse>({
    totalCollected: 0,
    totalOutstanding: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminSummary = async () => {
      try {
        // Admin endpoint: fetches summary across all businesses
        const res = await api.get("/admin/invoices/summary");
        setData(res.data);
      } catch (error) {
        console.error("Failed to load admin invoice summary", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminSummary();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse h-24" />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse h-24" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Total Outstanding */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Outstanding
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currency} {data.totalOutstanding.toLocaleString()}
            </h3>
            <p className="text-sm text-[#0A66C2] dark:text-gray-400">
              Amount yet to be collected across all businesses
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-[#0A66C2]" />
          </div>
        </div>
      </div>

      {/* Total Collected */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Collected
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currency} {data.totalCollected.toLocaleString()}
            </h3>
            <p className="text-sm text-[#0A66C2] dark:text-gray-400">
              Total payments received across all businesses
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400">
            <FontAwesomeIcon icon={faCircleCheck} className="text-[#0A66C2]" />
          </div>
        </div>
      </div>
    </div>
  );
}
