"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faTags,
  faComments,
  faUsers,
  faFileInvoiceDollar,
  faReceipt,
  faXmark,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import api from "../../../lib/api"; // Axios instance

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-white/20 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-0 flex items-center justify-center transition-transform duration-300 z-50 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl w-full max-w-6xl transform animate-modalSlideUp">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-[#0A66C2]">{title} Analysis</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-[#0A66C2] transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="text-2xl" />
            </button>
          </div>
          <div className="p-6 max-h-[85vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
}

interface KpiData {
  weekly: number[];
  monthly: number[];
  recentItems: any[];
  newUsers?: number;
  returningUsers?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  totalBusinesses?: number;
  newBusinesses?: number;
  activeBusinesses?: number;
  inactiveBusinesses?: number;
  paidInvoices?: number;
  unpaidInvoices?: number;
  totalRevenue?: number;
  breakdown?: Record<string, number>; // for Receipts categories
}

const COLORS = ["#0A66C2", "#FF7F50", "#00C49F", "#FFBB28", "#9B59B6"];

export default function AdminQuickActions() {
  const actions = [
    { href: "/dashboard/admin/subscriptions", label: "Subscriptions", icon: faTags },
    { href: "/dashboard/admin/support", label: "Support", icon: faComments },
    { href: "/dashboard/admin/profile", label: "Settings", icon: faGear },
  ];

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalReceipts, setTotalReceipts] = useState(0);
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const [loadingCounts, setLoadingCounts] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<
    "Users" | "Invoices" | "Receipts" | "Businesses" | null
  >(null);
  const [modalData, setModalData] = useState<KpiData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoadingCounts(true);
      try {
        const res = await api.get("/admin/dashboard-counts");
        const data = res.data;

        setTotalUsers(data.totalUsers ?? 0);
        setTotalInvoices(data.totalInvoices ?? 0);
        setTotalReceipts(data.totalReceipts ?? 0);
        setTotalBusinesses(data.totalBusinesses ?? 0);
      } catch (err) {
        console.error("Error fetching dashboard counts:", err);
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  const kpiActions = [
    { label: "Users", count: totalUsers, icon: faUsers, isKpi: true },
    { label: "Invoices", count: totalInvoices, icon: faFileInvoiceDollar, isKpi: true },
    { label: "Receipts", count: totalReceipts, icon: faReceipt, isKpi: true },
    { label: "Businesses", count: totalBusinesses, icon: faBuilding, isKpi: true },
  ];

  const combinedActions = [...kpiActions, ...actions.map((a) => ({ ...a, isKpi: false }))];

  const openModal = async (
    type: "Users" | "Invoices" | "Receipts" | "Businesses"
  ) => {
    setModalContent(type);
    setModalOpen(true);
    setModalLoading(true);

    try {
      // DEFAULT: dashboard details (Users & Businesses)
      if (type === "Users" || type === "Businesses") {
        const res = await api.get(`/admin/dashboard-details/${type.toLowerCase()}`);
        const data: KpiData = res.data;

        data.weekly = Array.isArray(data.weekly) ? data.weekly : [];
        data.monthly = Array.isArray(data.monthly) ? data.monthly : [];
        data.recentItems = Array.isArray(data.recentItems) ? data.recentItems : [];

        setModalData(data);
        return;
      }

      // INVOICES — SAME AS AdminInvoices page
      if (type === "Invoices") {
        const [kpiRes, invoicesRes] = await Promise.all([
          api.get("/admin/dashboard-details/invoices"),
          api.get("/invoices/admin"),
        ]);

        const invoices: RecentInvoice[] = invoicesRes.data || [];

        setModalData({
          ...kpiRes.data,
          recentItems: invoices.slice(0, 10), // last 5–10
        });
        return;
      }

      // RECEIPTS — SAME PATTERN
      if (type === "Receipts") {
        // Fetch KPI data
        const kpiRes = await api.get("/admin/dashboard-details/receipts");

        // Fetch invoices (same as invoices modal)
        const invoicesRes = await api.get("/invoices/admin");
        const invoices = invoicesRes.data || [];

        // Only keep invoices with status 'paid'
        const paidInvoices = invoices.filter(
          (inv: any) => String(inv.status).toLowerCase() === "paid"
        );

        setModalData({
          ...kpiRes.data,
          recentItems: paidInvoices.slice(0, 10),
        });

        return;
      }

    } catch (err) {
      console.error(`Error fetching ${type} modal data:`, err);
      setModalData({
        weekly: [],
        monthly: [],
        recentItems: [],
      });
    } finally {
      setModalLoading(false);
    }
  };

  const renderCharts = () => {
    if (!modalData) return null;

    const lineData = modalData.weekly.map((v, i) => ({ label: `Week ${i + 1}`, value: v }));

    let pieData: { name: string; value: number }[] = [];
    if (modalContent === "Users") {
      pieData = [
        { name: "New Users", value: modalData.newUsers ?? 0 },
        { name: "Returning", value: modalData.returningUsers ?? 0 },
        { name: "Active", value: modalData.activeUsers ?? 0 },
        { name: "Inactive", value: modalData.inactiveUsers ?? 0 },
      ];
    } else if (modalContent === "Invoices") {
      pieData = [
        { name: "Paid", value: modalData.paidInvoices ?? 0 },
        { name: "Unpaid", value: modalData.unpaidInvoices ?? 0 },
      ];
    } else if (modalContent === "Receipts") {
      // Use breakdown categories if provided, else single total
      if (modalData.breakdown && Object.keys(modalData.breakdown).length > 0) {
        pieData = Object.entries(modalData.breakdown).map(([k, v]) => ({ name: k, value: v }));
      } else {
        pieData = [{ name: "Total", value: modalData.weekly.reduce((a, b) => a + b, 0) }];
      }
    } else if (modalContent === "Businesses") {
      pieData = [
        { name: "Active", value: modalData.activeBusinesses ?? 0 },
        { name: "Inactive", value: modalData.inactiveBusinesses ?? 0 },
        { name: "New", value: modalData.newBusinesses ?? 0 },
      ];
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow">
          <h3 className="text-sm font-medium text-[#0A66C2] mb-2">Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0A66C2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {pieData.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium text-[#0A66C2] mb-2">Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={80}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const computeAvg = (arr?: number[]) =>
    arr && arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : "0";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 font-sans">
      <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 justify-items-center">
        {combinedActions.map((item, idx) => (
          <div key={idx} className="w-full max-w-[140px]">
            {item.isKpi ? (
              // Rectangular KPI cards for first four
              <button
                onClick={() =>
                  openModal(
                    item.label as "Users" | "Invoices" | "Receipts" | "Businesses"
                  )
                }
                className="flex flex-col items-start justify-center gap-1 w-full py-3 px-4 rounded-lg
                          bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200
                          hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {item.label}
                </div>
                <div className="text-xl font-bold truncate">
                  {loadingCounts ? "…" : item.count.toLocaleString()}
                </div>
              </button>
            ) : (
              // Keep original style for Subscriptions, Support, Settings
              <a
                href={item.href ?? "#"}
                className="flex flex-col items-center justify-center gap-2 w-full py-2 rounded-lg
                          text-[#0A66C2] dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center
                                group-hover:scale-110 transition-transform text-sm font-bold">
                  <FontAwesomeIcon icon={item.icon} className="text-xl" />
                </div>
                <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
              </a>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalContent ?? ""}
      >
        {modalLoading ? (
          <div className="flex justify-center items-center h-full">
            <span className="animate-spin border-b-2 border-[#0A66C2] rounded-full w-6 h-6" />
          </div>
        ) : (
          modalData && (
            <div className="space-y-6 text-gray-800 dark:text-gray-200">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow">
                  <h3 className="text-sm font-medium text-[#0A66C2]">Total {modalContent}</h3>
                  <p className="text-2xl font-bold">
                    {modalContent === "Users"
                      ? totalUsers
                      : modalContent === "Invoices"
                      ? totalInvoices
                      : modalContent === "Receipts"
                      ? totalReceipts
                      : modalContent === "Businesses"
                      ? totalBusinesses
                      : 0}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow">
                  <h3 className="text-sm font-medium text-[#0A66C2]">Weekly Avg</h3>
                  <p className="text-2xl font-bold">{computeAvg(modalData.weekly)}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow">
                  <h3 className="text-sm font-medium text-[#0A66C2]">Monthly Avg</h3>
                  <p className="text-2xl font-bold">{computeAvg(modalData.monthly)}</p>
                </div>
              </div>

              {/* Charts + Breakdown */}
              {renderCharts()}

              {/* Recent Items */}
              <div>
                <h3 className="font-semibold text-[#0A66C2] mb-3">
                  Recent {modalContent}
                </h3>

                {(modalContent === "Invoices" || modalContent === "Receipts") ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left">
                            {modalContent === "Invoices" ? "Invoice ID" : "Receipt ID"}
                          </th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Date</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y dark:divide-gray-700">
                        {modalData.recentItems
                          .filter((item: any) =>
                            modalContent === "Receipts"
                              ? String(item.status).toLowerCase() === "paid"
                              : true
                          )
                          .map((item: any, idx: number) => {
                            const date =
                              modalContent === "Receipts"
                                ? item.updated_at || item.receiptDate || item.createdAt
                                : item.invoiceDate || item.createdAt;

                            return (
                              <tr
                                key={idx}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                <td className="px-4 py-2 font-medium">
                                  {item.userGeneratedInvoiceId ||
                                    item.invoiceId ||
                                    item.userGeneratedReceiptId ||
                                    item.receiptId ||
                                    "—"}
                                </td>

                                <td className="px-4 py-2 capitalize">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold
                                      ${
                                        item.status === "issued" || item.status === "paid"
                                          ? "bg-green-100 text-green-700"
                                          : item.status === "partial"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : item.status === "void" || item.status === "unpaid"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                  >
                                    {item.status ?? "—"}
                                  </span>
                                </td>

                                <td className="px-4 py-2">
                                  {date &&
                                    new Date(date).toLocaleDateString(undefined, {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <ul className="list-disc list-inside">
                    {modalData.recentItems.slice(0, 10).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>

            </div>
          )
        )}
      </Modal>
    </div>
  );
}
