"use client";

import React, { useState, useEffect } from "react";
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
  };
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [replyMessages, setReplyMessages] = useState<{ [key: number]: string }>({});
  const [statuses, setStatuses] = useState<{ [key: number]: SupportTicket["status"] }>({});

// Helper to display full name correctly
const getFullName = (user: SupportTicket["user"]) => {
  if (!user) return "Unknown Customer";

  // Prefer 'name' if provided
  if (user.name) return user.name;

  // Otherwise, construct from firstName + lastName (avoid duplicates)
  // @ts-ignore
  const first = user.firstName?.trim() || "";
  // @ts-ignore
  const last = user.lastName?.trim() || "";

  const fullName = [first, last].filter(Boolean).join(" ");
  return fullName || "Unknown Customer";
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

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Admin Support Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Manage and respond to all customer support tickets.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 space-y-4 max-h-[80vh] overflow-y-auto">
          {loadingTickets ? (
            <ComponentCard className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Loading tickets...</p>
            </ComponentCard>
          ) : tickets.length === 0 ? (
            <ComponentCard className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No support tickets found.</p>
            </ComponentCard>
          ) : (
            tickets.map((ticket) => {
              const currentStatus = statuses[ticket.ticketId] || ticket.status;
              const isActive = ticket.ticketId === selectedTicketId;
              const userName = getFullName(ticket.user);
              const userEmail = ticket.user?.email || "No Email";

              return (
                <button
                  key={ticket.ticketId}
                  onClick={() => handleTicketSelect(ticket.ticketId)}
                  className={`w-full text-left px-5 py-4 rounded-xl shadow hover:shadow-lg transition flex justify-between items-center ${
                    isActive ? "bg-[#0A66C2] text-white" : "bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className={`font-medium ${isActive ? "text-white" : "text-gray-900 dark:text-white"}`}>
                      {userName}
                    </span>
                    <span className={`text-sm ${isActive ? "text-gray-100" : "text-gray-500 dark:text-gray-300"}`}>
                      {ticket.subject}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{userEmail}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isActive ? "bg-white text-[#0A66C2]" : getStatusColor(currentStatus)
                    }`}
                  >
                    {currentStatus.replace("_", " ").charAt(0).toUpperCase() +
                      currentStatus.replace("_", " ").slice(1)}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Main content */}
        <div className="flex-1">
          {selectedTicket ? (
            <ComponentCard className="overflow-hidden shadow-lg">
              {/* Header */}
              <div className="px-6 py-5 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedTicket.subject}</h2>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                    statuses[selectedTicket.ticketId] || selectedTicket.status
                  )}`}
                >
                  {(statuses[selectedTicket.ticketId] || selectedTicket.status)
                    .replace("_", " ")
                    .charAt(0)
                    .toUpperCase() +
                    (statuses[selectedTicket.ticketId] || selectedTicket.status)
                      .replace("_", " ")
                      .slice(1)}
                </span>
              </div>

              {/* Chat Area */}
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
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
                    name={reply.is_admin ? "You" : getFullName(selectedTicket.user)}
                    message={reply.message}
                    createdAt={reply.created_at}
                  />
                ))}
              </div>

              {/* Reply & Status */}
              <div className="p-6 border-t dark:border-gray-700 space-y-6">
                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Update Status
                  </label>
                  <select
                    value={statuses[selectedTicket.ticketId] || selectedTicket.status}
                    onChange={(e) =>
                      handleStatusChange(selectedTicket.ticketId, e.target.value as SupportTicket["status"])
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0A66C2] focus:outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {(statuses[selectedTicket.ticketId] || selectedTicket.status) === "open" ||
                (statuses[selectedTicket.ticketId] || selectedTicket.status) === "in_progress" ? (
                  <div className="flex gap-4">
                    <textarea
                      value={replyMessages[selectedTicket.ticketId] || ""}
                      onChange={(e) => handleReplyChange(selectedTicket.ticketId, e.target.value)}
                      rows={4}
                      placeholder="Write a reply to the customer..."
                      className="flex-1 px-5 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                    />
                    <div className="flex flex-col justify-end">
                      <Button
                        onClick={() => handleReplySubmit(selectedTicket.ticketId)}
                        disabled={!replyMessages[selectedTicket.ticketId]?.trim()}
                        className="px-8 py-4 !bg-[#0A66C2] !hover:bg-[#084d93] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send Reply
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <p className="text-lg font-medium text-green-800 dark:text-green-400">
                      This ticket is {(statuses[selectedTicket.ticketId] || selectedTicket.status) === "resolved"
                        ? "resolved"
                        : "closed"}.
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                      No further replies can be sent.
                    </p>
                  </div>
                )}
              </div>
            </ComponentCard>
          ) : (
            <ComponentCard className="p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">Select a ticket to view details</p>
            </ComponentCard>
          )}
        </div>
      </div>
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
          className={`rounded-2xl px-6 py-4 shadow ${
            isAdmin
              ? "bg-[#0A66C2] text-white rounded-tr-none"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none"
          }`}
        >
          <p className="text-sm font-medium mb-2">{isAdmin ? "You (Support)" : `${name} (Customer)`}</p>
          <p className="whitespace-pre-wrap">{message}</p>
        </div>
        <p className={`text-xs text-gray-500 mt-2 ${isAdmin ? "text-right" : "text-left"}`}>
          {new Date(createdAt).toLocaleString("en-US", { hour12: true })}
        </p>
      </div>
    </div>
  );
}
