"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../../lib/api";

interface SummaryResponse {
  collected: number;
  outstanding: number;
}

export default function OutstandingAndCollected({
  currency,
}: {
  currency: string;
}) {
  const [data, setData] = useState<SummaryResponse>({
    collected: 0,
    outstanding: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/invoices/summary");
        setData(res.data);
      } catch (error) {
        console.error("Failed to load invoice summary", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
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
      {/* Outstanding */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Outstanding
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currency} {data.outstanding.toLocaleString()}
            </h3>
            <p className="text-sm text-[#0A66C2] dark:text-gray-400">
              Amount yet to receive
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-[#0A66C2]" />
          </div>
        </div>
      </div>

      {/* Collected */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Collected
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currency} {data.collected.toLocaleString()}
            </h3>
            <p className="text-sm text-[#0A66C2] dark:text-gray-400">
              Total payments received
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
