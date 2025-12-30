"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ChevronLeftIcon, EyeIcon, InfoIcon } from "@/icons";
import Icon from "@/components/Icons";
import api from "../../../lib/api";
import Badge from "@/components/ui/badge/Badge";

/* ---------------- Types ---------------- */

interface Tenant {
  tenantId: number;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string | null;
  tenantLogo: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Customer {
  customerId: number;
  tenantId: number;
  customerName: string;
  customerAddress: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  created_at: string;
  updated_at: string;
  tenant: Tenant;
}

/* ---------------- Component ---------------- */

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tenantFilter, setTenantFilter] = useState<string>("all");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers/admin"); // Adjust endpoint as needed
        setCustomers(res.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const formatDate = (date: string | null) =>
    date
      ? new Date(date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const formatAddress = (address: string | null) =>
    address ? address.replace(/\n/g, ", ") : "No address provided";

  // Get unique tenants for filter dropdown
  const uniqueTenants = Array.from(
    new Map(customers.map((c) => [c.tenant.tenantId, c.tenant])).values()
  );

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchTerm === "" ||
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.customerEmail &&
        customer.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.customerPhone && customer.customerPhone.includes(searchTerm)) ||
      customer.tenant.tenantName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTenant =
      tenantFilter === "all" || customer.tenant.tenantId === Number(tenantFilter);

    return matchesSearch && matchesTenant;
  });

  const openModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
    document.body.style.overflow = "unset";
  };

  return (
    <div className="relative min-h-screen">
      <div className="space-y-6 py-6 px-4 md:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900"
            >
              <Icon src={ChevronLeftIcon} className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Customers Management
            </h1>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total: <span className="font-medium">{customers.length}</span>
            {filteredCustomers.length !== customers.length && (
              <span className="ml-2">
                (Filtered: {filteredCustomers.length})
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, phone, or tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="all">All Tenants</option>
              {uniqueTenants.map((tenant) => (
                <option key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.tenantName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Customer
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Contact
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Business
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Created
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-gray-500 dark:text-gray-400">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-red-600">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm || tenantFilter !== "all"
                        ? "No customers match your filters."
                        : "No customers found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer.customerId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => openModal(customer)}
                    >
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 flex items-center justify-center font-semibold text-[#0A66C2]">
                            {customer.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-gray-800 dark:text-white/90 block">
                              {customer.customerName}
                            </span>
                            <span className="text-xs text-gray-500">ID: #{customer.customerId}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        <div className="space-y-1">
                          {customer.customerEmail ? (
                            <div className="text-theme-sm text-gray-600 dark:text-gray-400">
                              {customer.customerEmail}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">No email</span>
                          )}
                          {customer.customerPhone && (
                            <div className="text-xs text-gray-500">
                              {customer.customerPhone}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <Icon src={InfoIcon} className="w-5 h-5 text-gray-500" />
                          <div>
                            <span className="font-medium block">{customer.tenant.tenantName}</span>
                            <span className="text-xs text-gray-500">
                              {customer.tenant.tenantEmail}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                        {formatDate(customer.created_at)}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(customer);
                          }}
                          className="text-gray-600 hover:text-brand-600 transition"
                          title="View customer details"
                        >
                          <Icon src={EyeIcon} className="w-5 h-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Customer Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 flex items-center justify-center text-3xl font-bold text-[#0A66C2]">
                  {selectedCustomer.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCustomer.customerName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Customer ID: #{selectedCustomer.customerId}
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <Badge color="info" size="md">
                      Business: {selectedCustomer.tenant.tenantName}
                    </Badge>
                    <Badge color={selectedCustomer.tenant.status === "active" ? "success" : "secondary"} size="md">
                      {selectedCustomer.tenant.status.charAt(0).toUpperCase() + selectedCustomer.tenant.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium break-all">
                        {selectedCustomer.customerEmail || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium">
                        {selectedCustomer.customerPhone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <p className="font-medium text-sm">
                        {formatAddress(selectedCustomer.customerAddress)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                    Associated Business
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Business Name</p>
                      <p className="font-medium">{selectedCustomer.tenant.tenantName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Business Email</p>
                      <p className="font-medium break-all">{selectedCustomer.tenant.tenantEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Business Phone</p>
                      <p className="font-medium">
                        {selectedCustomer.tenant.tenantPhone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 mb-3">
                    Customer Timeline
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                      <p className="font-medium">{formatDate(selectedCustomer.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                      <p className="font-medium">{formatDate(selectedCustomer.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}