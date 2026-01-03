"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faCircleCheck,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../../lib/api";

interface AdminCurrencySummary {
  currency_code: number;
  currency_symbol: string;
  collected: number;
  outstanding: number;
}

export default function AdminOutstandingAndCollected() {
  const [data, setData] = useState<AdminCurrencySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchAdminSummary = async () => {
      try {
        const res = await api.get("/invoices/admin-summary");
        setData(res.data);
      } catch (error) {
        console.error("Failed to load admin invoice summary", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminSummary();
  }, []);

  const visibleData = showAll ? data : data.slice(0, 1);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleData.map((item) => (
          <React.Fragment key={item.currency_code}>
            {/* Outstanding */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Outstanding
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {item.currency_symbol}{" "}
                    {item.outstanding.toLocaleString()}
                  </h3>
                  <p className="text-sm text-[#0A66C2] dark:text-gray-400">
                    Currency ID: {item.currency_code}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faMoneyBillWave}
                    className="text-[#0A66C2]"
                  />
                </div>
              </div>
            </div>

            {/* Collected */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Collected
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {item.currency_symbol}{" "}
                    {item.collected.toLocaleString()}
                  </h3>
                  <p className="text-sm text-[#0A66C2] dark:text-gray-400">
                    Currency ID: {item.currency_code}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="text-[#0A66C2]"
                  />
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* View More / View Less */}
      {data.length > 1 && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 text-sm font-medium text-[#0A66C2] hover:underline"
          >
            {showAll ? "View less" : "View more"}
            <FontAwesomeIcon icon={showAll ? faChevronUp : faChevronDown} />
          </button>
        </div>
      )}
    </div>
  );
}
