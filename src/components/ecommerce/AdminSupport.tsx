// app/support/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import ComponentCard from "../common/ComponentCard";
import Button from "../ui/button/Button";
import api from "../../../lib/api";

interface SupportReply {
  replyId: number;
  message: string;
  is_admin: boolean;
  created_at: string;
}

interface SupportTicket {
  ticketId: number;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  replies: SupportReply[];
  user: { name: string; email: string };
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [openTicketId, setOpenTicketId] = useState<number | null>(null);
  const [replyMessages, setReplyMessages] = useState<{ [key: number]: string }>({});
  const [statuses, setStatuses] = useState<{ [key: number]: SupportTicket["status"] }>({});

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  
  // Collapsible filter panel
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoadingTickets(true);
        const res = await api.get("/support/tickets/all");
        setTickets(res.data?.tickets || []);
      } catch (err) {
        console.error("Failed to load tickets:", err);
        setTickets([]);
      } finally {
        setLoadingTickets(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (statusFilter !== "all" && ticket.status !== statusFilter) {
        return false;
      }

      const ticketDate = new Date(ticket.created_at);

      if (dateFrom) {
        const from = new Date(dateFrom);
        if (ticketDate < from) return false;
      }

      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (ticketDate > to) return false;
      }

      return true;
    });
  }, [tickets, statusFilter, dateFrom, dateTo]);

  const hasActiveFilters = statusFilter !== "all" || dateFrom || dateTo;

  const clearFilters = () => {
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  // ... (handleReplyChange, handleReplySubmit, handleStatusChange, formatDate, getStatusColor remain unchanged)

  const handleReplyChange = (ticketId: number, value: string) => {
    setReplyMessages((prev) => ({ ...prev, [ticketId]: value }));
  };

  const handleReplySubmit = async (ticketId: number) => {
    const message = replyMessages[ticketId]?.trim();
    if (!message) return;

    try {
      await api.post(`/support/tickets/${ticketId}/admin-reply`, { message });
      setReplyMessages((prev) => ({ ...prev, [ticketId]: "" }));
      const res = await api.get("/support/tickets/all");
      setTickets(res.data?.tickets || []);
    } catch (err) {
      alert("Failed to send reply. Please try again.");
    }
  };

  const handleStatusChange = async (ticketId: number, newStatus: SupportTicket["status"]) => {
    try {
      await api.patch(`/support/tickets/${ticketId}/status`, { status: newStatus });
      setStatuses((prev) => ({ ...prev, [ticketId]: newStatus }));
      const res = await api.get("/support/tickets/all");
      setTickets(res.data?.tickets || []);
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: SupportTicket["status"]) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "resolved":
      case "closed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const toggleTicket = (ticketId: number) => {
    setOpenTicketId(openTicketId === ticketId ? null : ticketId);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Admin Support Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Manage and respond to all customer support tickets.
        </p>
      </div>

      {/* Collapsible Filters */}
      <ComponentCard className="mb-8 overflow-hidden">
        {/* Filter Header - Clickable */}
        <button
          onClick={toggleFilters}
          className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filters
            </h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 text-xs font-medium bg-[#0A66C2] text-white rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing <strong>{filteredTickets.length}</strong> of <strong>{tickets.length}</strong> tickets
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${isFiltersOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Filter Body - Collapsible */}
        {isFiltersOpen && (
          <div className="p-6 border-t dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0A66C2] focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0A66C2] focus:outline-none"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0A66C2] focus:outline-none"
                />
              </div>

              {/* Clear Button */}
              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full"
                  disabled={!hasActiveFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </ComponentCard>

      {/* Tickets List */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Support Tickets
          </h2>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* ... rest of the ticket list remains exactly the same ... */}
        {loadingTickets ? (
          <ComponentCard className="p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading tickets...</p>
          </ComponentCard>
        ) : filteredTickets.length === 0 ? (
          <ComponentCard className="p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {tickets.length === 0
                ? "No support tickets found."
                : "No tickets match the selected filters."}
            </p>
          </ComponentCard>
        ) : (
          <div className="space-y-6">
            {filteredTickets.map((ticket) => {
              const currentStatus = statuses[ticket.ticketId] || ticket.status;
              const isOpen = openTicketId === ticket.ticketId;

              return (
                <ComponentCard
                  key={ticket.ticketId}
                  className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  {/* Ticket Header & Expanded View - unchanged */}
                  <button
                    onClick={() => toggleTicket(ticket.ticketId)}
                    className="w-full text-left px-6 py-5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {ticket.subject}
                      </h3>
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>Ticket #{ticket.ticketId}</span>
                        <span className="mx-2">•</span>
                        <span>{ticket.user.name} ({ticket.user.email})</span>
                        <span className="mx-2">•</span>
                        <span>Opened {formatDate(ticket.created_at)}</span>
                        {ticket.updated_at !== ticket.created_at && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-xs italic">Updated {formatDate(ticket.updated_at)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}
                      >
                        {currentStatus.replace("_", " ").charAt(0).toUpperCase() + currentStatus.replace("_", " ").slice(1)}
                      </span>
                      <svg
                        className={`w-6 h-6 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-8 bg-white dark:bg-gray-900 border-t dark:border-gray-700">
                      <div className="mb-8 space-y-6 max-h-96 overflow-y-auto pr-2">
                        <div className="flex justify-start">
                          <div className="max-w-2xl">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-6 py-4 shadow">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {ticket.user.name} (Customer)
                              </p>
                              <p className="whitespace-pre-wrap text-gray-900 dark:text-white">{ticket.message}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDate(ticket.created_at)}
                            </p>
                          </div>
                        </div>

                        {ticket.replies.map((reply) => (
                          <div
                            key={reply.replyId}
                            className={`flex ${reply.is_admin ? "justify-end" : "justify-start"}`}
                          >
                            <div className="max-w-2xl">
                              <div
                                className={`rounded-2xl px-6 py-4 shadow ${
                                  reply.is_admin
                                    ? "bg-[#0A66C2] text-white rounded-tr-none"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none"
                                }`}
                              >
                                <p className="text-sm font-medium mb-2">
                                  {reply.is_admin ? "You (Support)" : `${ticket.user.name} (Customer)`}
                                </p>
                                <p className="whitespace-pre-wrap">{reply.message}</p>
                              </div>
                              <p className={`text-xs text-gray-500 mt-2 ${reply.is_admin ? "text-right" : "text-left"}`}>
                                {formatDate(reply.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mb-8 max-w-xs">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Update Status
                        </label>
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(ticket.ticketId, e.target.value as SupportTicket["status"])}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0A66C2] focus:outline-none"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>

                      {(currentStatus === "open" || currentStatus === "in_progress") && (
                        <div className="flex gap-4">
                          <textarea
                            value={replyMessages[ticket.ticketId] || ""}
                            onChange={(e) => handleReplyChange(ticket.ticketId, e.target.value)}
                            rows={4}
                            placeholder="Write a reply to the customer..."
                            className="flex-1 px-5 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                          />
                          <div className="flex flex-col justify-end">
                            <Button
                              onClick={() => handleReplySubmit(ticket.ticketId)}
                              disabled={!replyMessages[ticket.ticketId]?.trim()}
                              className="px-8 py-4 bg-[#0A66C2] hover:bg-[#084d93] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Send Reply
                            </Button>
                          </div>
                        </div>
                      )}

                      {(currentStatus === "resolved" || currentStatus === "closed") && (
                        <div className="text-center py-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <p className="text-lg font-medium text-green-800 dark:text-green-400">
                            This ticket is {currentStatus === "resolved" ? "resolved" : "closed"}.
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                            No further replies can be sent.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </ComponentCard>
              );
            })}
          </div>
         
        )}
      </div>
    </div>
  );
}