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
  user?: {
    name?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [replyMessages, setReplyMessages] = useState<{ [key: number]: string }>({});
  const [statuses, setStatuses] = useState<{ [key: number]: SupportTicket["status"] }>({});
  const [statusFilter, setStatusFilter] = useState<"all" | SupportTicket["status"]>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatClosing, setIsChatClosing] = useState(false);

  // Helper to display full name safely
  const getFullName = (user: SupportTicket["user"]) => {
    if (!user) return "Unknown Customer";
    if (user.name) return user.name;
    const first = user.firstName?.trim() || "";
    const last = user.lastName?.trim() || "";
    const fullName = [first, last].filter(Boolean).join(" ");
    return fullName || "Unknown Customer";
  };

  // Fetch tickets
  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await api.get("/support/tickets/all");
      const fetchedTickets: SupportTicket[] = res.data?.tickets || [];
      setTickets(fetchedTickets);
      if (!selectedTicketId && fetchedTickets.length > 0) {
        setSelectedTicketId(fetchedTickets[0].ticketId);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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

  const handleTicketSelect = (ticketId: number) => setSelectedTicketId(ticketId);
  const handleReplyChange = (ticketId: number, value: string) =>
    setReplyMessages((prev) => ({ ...prev, [ticketId]: value }));

  const handleReplySubmit = async (ticketId: number) => {
    const message = replyMessages[ticketId]?.trim();
    if (!message) return;

    try {
      await api.post(`/support/tickets/${ticketId}/admin-reply`, { message });
      setReplyMessages((prev) => ({ ...prev, [ticketId]: "" }));
      fetchTickets();
    } catch (err) {
      alert("Failed to send reply. Please try again.");
    }
  };

  const handleStatusChange = async (ticketId: number, newStatus: SupportTicket["status"]) => {
    try {
      await api.patch(`/support/tickets/${ticketId}/status`, { status: newStatus });
      setStatuses((prev) => ({ ...prev, [ticketId]: newStatus }));
      fetchTickets();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const selectedTicket = tickets.find((t) => t.ticketId === selectedTicketId);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      in_progress: tickets.filter((t) => t.status === "in_progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      closed: tickets.filter((t) => t.status === "closed").length,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const customerName = getFullName(ticket.user).toLowerCase();
      const matchesTerm =
        !term ||
        customerName.includes(term) ||
        ticket.subject.toLowerCase().includes(term) ||
        ticket.message.toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [tickets, statusFilter, searchTerm]);

  useEffect(() => {
    if (!filteredTickets.length) {
      setSelectedTicketId(null);
      setIsChatOpen(false);
      return;
    }
    if (!selectedTicketId || !filteredTickets.some((t) => t.ticketId === selectedTicketId)) {
      setSelectedTicketId(filteredTickets[0].ticketId);
    }
  }, [filteredTickets, selectedTicketId]);

  useEffect(() => {
    if (!selectedTicketId) setIsChatOpen(false);
  }, [selectedTicketId]);

  const openChat = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatClosing(true);
    window.setTimeout(() => {
      setIsChatOpen(false);
      setIsChatClosing(false);
    }, 200);
  };

  const statusOptions: Array<{ value: "all" | SupportTicket["status"]; label: string }> = [
    { value: "all", label: "All" },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  return (
    <div className="relative overflow-hidden bg-[#f8f7f4] text-gray-900 dark:bg-[#0b0f14] dark:text-gray-100">
      <style jsx>{`
        @keyframes supportFade {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-[-5%] h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-[#0A66C2]/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_45%)] dark:bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.2),_transparent_55%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-black/5 bg-white/85 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Admin Support</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              Command center for every customer conversation.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
              Monitor response queues, resolve blockers, and keep customers informed with clear status updates.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-600/20 bg-emerald-600/10 px-4 py-2 text-xs font-semibold text-emerald-700">
                Queue visibility
              </span>
              <span className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
                Multi-channel responses
              </span>
              <span className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
                Status automation ready
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-gradient-to-br from-white/90 via-white/70 to-white/40 p-5 shadow-[0_14px_32px_rgba(15,23,42,0.1)] dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-transparent">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Queue snapshot</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Open", value: stats.open, accent: "text-blue-700" },
                { label: "In progress", value: stats.in_progress, accent: "text-amber-700" },
                { label: "Resolved", value: stats.resolved, accent: "text-emerald-700" },
                { label: "Closed", value: stats.closed, accent: "text-gray-700" },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl border border-black/10 bg-white/80 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{card.label}</p>
                  <p className={`mt-2 text-2xl font-semibold ${card.accent} dark:text-white`}>{card.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-black/10 bg-white/80 p-3 text-xs text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              <p className="font-semibold text-gray-900 dark:text-white">Current workload</p>
              <p className="mt-1">Total active tickets: {stats.open + stats.in_progress}</p>
            </div>
          </div>
        </section>

        <section className="mt-4">
          <div className="rounded-3xl border border-black/5 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Ticket queue</p>
                <h2 className="mt-2 text-2xl font-semibold">Customer requests</h2>
              </div>
              <div className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-300">
                Total: {stats.total}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    statusFilter === option.value
                      ? "bg-[#0A66C2] text-white shadow"
                      : "border border-black/10 bg-white/70 text-gray-700 hover:border-[#0A66C2]/40 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-3">
              <label className="sr-only" htmlFor="admin-ticket-search">
                Search tickets
              </label>
              <input
                id="admin-ticket-search"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by customer, subject, or message"
                className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-gray-700 shadow-sm focus:border-[#0A66C2] focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/20 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
              />
            </div>

            <div className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              {loadingTickets ? (
                <ComponentCard className="p-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400">Loading tickets...</p>
                </ComponentCard>
              ) : filteredTickets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
                  No tickets match the current filters.
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const currentStatus = statuses[ticket.ticketId] || ticket.status;
                  const isActive = ticket.ticketId === selectedTicketId;
                  const userName = getFullName(ticket.user);
                  const userEmail = ticket.user?.email || "No Email";

                  return (
                    <button
                      key={ticket.ticketId}
                      onClick={() => openChat(ticket.ticketId)}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${
                        isActive
                          ? "border-[#0A66C2]/40 bg-[#0A66C2]/10 shadow"
                          : "border-black/10 bg-white/80 hover:border-[#0A66C2]/30 dark:border-white/10 dark:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={`text-sm font-semibold ${isActive ? "text-[#0A66C2]" : "text-gray-900 dark:text-white"}`}>
                            {userName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{ticket.subject}</p>
                          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{userEmail}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(currentStatus)}`}>
                          {currentStatus.replace("_", " ").charAt(0).toUpperCase() + currentStatus.replace("_", " ").slice(1)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>

      {isChatOpen && selectedTicket && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 transition-opacity ${
            isChatClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={closeChat}
        >
          <div
            className={`relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.35)] transition-all dark:bg-[#0f141b] ${
              isChatClosing ? "translate-y-4 scale-95 opacity-0" : "translate-y-0 scale-100 opacity-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4 dark:border-white/10">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Ticket detail</p>
                <h2 className="mt-2 text-2xl font-semibold">{selectedTicket.subject}</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {getFullName(selectedTicket.user)} • {selectedTicket.user?.email || "No email"}
                </p>
              </div>
              <button
                onClick={closeChat}
                className="rounded-full border border-black/10 p-2 text-gray-500 transition hover:text-gray-900 dark:border-white/10 dark:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-6">
              <div className="flex items-start justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Opened {formatDate(selectedTicket.created_at)}
                </p>
                <span
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${getStatusColor(
                    statuses[selectedTicket.ticketId] || selectedTicket.status
                  )}`}
                >
                  {(statuses[selectedTicket.ticketId] || selectedTicket.status)
                    .replace("_", " ")
                    .charAt(0)
                    .toUpperCase() +
                    (statuses[selectedTicket.ticketId] || selectedTicket.status).replace("_", " ").slice(1)}
                </span>
              </div>

              <MessageBubble
                isAdmin={false}
                name={getFullName(selectedTicket.user)}
                message={selectedTicket.message}
                createdAt={selectedTicket.created_at}
              />

              {selectedTicket.replies.map((reply) => (
                <MessageBubble
                  key={reply.replyId}
                  isAdmin={reply.is_admin}
                  name={reply.is_admin ? "Support" : getFullName(selectedTicket.user)}
                  message={reply.message}
                  createdAt={reply.created_at}
                />
              ))}
            </div>

            <div className="border-t border-black/5 px-6 py-5 dark:border-white/10">
              <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Update status
                  </label>
                  <select
                    value={statuses[selectedTicket.ticketId] || selectedTicket.status}
                    onChange={(e) =>
                      handleStatusChange(selectedTicket.ticketId, e.target.value as SupportTicket["status"])
                    }
                    className="mt-3 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-gray-700 shadow-sm focus:border-[#0A66C2] focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/20 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {(statuses[selectedTicket.ticketId] || selectedTicket.status) === "open" ||
                (statuses[selectedTicket.ticketId] || selectedTicket.status) === "in_progress" ? (
                  <div className="flex flex-col gap-3">
                    <textarea
                      value={replyMessages[selectedTicket.ticketId] || ""}
                      onChange={(e) => handleReplyChange(selectedTicket.ticketId, e.target.value)}
                      rows={4}
                      placeholder="Write a confident, actionable reply to the customer."
                      className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-gray-700 shadow-sm focus:border-[#0A66C2] focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/20 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleReplySubmit(selectedTicket.ticketId)}
                        disabled={!replyMessages[selectedTicket.ticketId]?.trim()}
                        className="px-8 py-3 !bg-[#0A66C2] !hover:bg-[#084d93] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send Reply
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
                    This ticket is {(statuses[selectedTicket.ticketId] || selectedTicket.status) === "resolved"
                      ? "resolved"
                      : "closed"}. No further replies can be sent.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Chat bubble component
interface MessageBubbleProps {
  isAdmin: boolean;
  name: string;
  message: string;
  createdAt: string;
}
function MessageBubble({ isAdmin, name, message, createdAt }: MessageBubbleProps) {
  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
      <div className="max-w-2xl">
        <div
          className={`rounded-3xl px-6 py-4 shadow ${
            isAdmin
              ? "bg-[#0A66C2] text-white"
              : "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-300">
            {isAdmin ? "Support" : name}
          </p>
          <p className="whitespace-pre-wrap">{message}</p>
        </div>
        <p className={`text-xs text-gray-500 mt-2 ${isAdmin ? "text-right" : "text-left"}`}>
          {new Date(createdAt).toLocaleString("en-US", { hour12: true })}
        </p>
      </div>
    </div>
  );
}
