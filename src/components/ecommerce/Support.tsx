// app/support/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import api from "../../../lib/api";
import { useModal } from "../../../context/ModalContext"; // Adjust if your modal context is named differently

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
  user?: { name: string; email: string }; // Only present in admin view
}

interface FormData {
  subject: string;
  message: string;
}

interface CurrentUser {
  role: "admin" | "user";
  // Add other user fields if needed
}


function CreateTicketForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({ subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { closeModal } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);
    setStatus("idle");
    setErrorMsg(null);

    try {
      await api.post("/support/tickets", formData);
      setStatus("success");
      setFormData({ subject: "", message: "" });
      setTimeout(() => {
        onSuccess();
        closeModal();
        // Optionally trigger ticket refresh here via context or callback
      }, 1500);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.response?.data?.message || "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === "success" && (
        <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-center">
          Ticket created successfully!
        </div>
      )}

      {status === "error" && errorMsg && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-center">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
          placeholder="e.g. Payment issue"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={6}
          required
          placeholder="Describe your issue..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" onClick={closeModal} variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="!bg-[#0A66C2] !hover:bg-[#084d93]">
          {isSubmitting ? "Sending..." : "Send Request"}
        </Button>
      </div>
    </form>
  );
}

export default function SupportPage() {
  const [formData, setFormData] = useState<FormData>({
    subject: "",
    message: "",
  });

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [openTicketId, setOpenTicketId] = useState<number | null>(null);
  const [replyMessages, setReplyMessages] = useState<{ [key: number]: string }>({});
  const [statuses, setStatuses] = useState<{ [key: number]: SupportTicket["status"] }>({});

  const { openModal, closeModal, isModalOpen } = useModal();

  useEffect(() => {
    const fetchUserAndTickets = async () => {
      try {
        setLoadingTickets(true);

        // Fetch current user to determine role
        const userRes = await api.get("/user"); // Adjust endpoint if different
        const user = userRes.data;
        setCurrentUser(user);

        // Determine which endpoint to use
        const endpoint =
          user.role === "admin" ? "/support/tickets/all" : "/support/tickets";

        const ticketsRes = await api.get(endpoint);
        setTickets(ticketsRes.data?.tickets || []);
      } catch (err) {
        console.error("Failed to load data:", err);
        setTickets([]);
      } finally {
        setLoadingTickets(false);
      }
    };

    fetchUserAndTickets();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage(null);

    try {
      await api.post("/support/tickets", {
        subject: formData.subject,
        message: formData.message,
      });

      setSubmitStatus("success");
      setFormData({ subject: "", message: "" });
      closeModal();

      // Refresh tickets
      const endpoint =
        currentUser?.role === "admin" ? "/support/tickets/all" : "/support/tickets";
      const res = await api.get(endpoint);
      setTickets(res.data?.tickets || []);
    } catch (err: any) {
      setSubmitStatus("error");
      setErrorMessage(
        err?.response?.data?.message || "Failed to send message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyChange = (ticketId: number, value: string) => {
    setReplyMessages((prev) => ({ ...prev, [ticketId]: value }));
  };

  const handleReplySubmit = async (ticketId: number) => {
    const message = replyMessages[ticketId]?.trim();
    if (!message) return;

    try {
      await api.post(`/support/tickets/${ticketId}/reply`, { message });
      setReplyMessages((prev) => ({ ...prev, [ticketId]: "" }));

      // Refresh tickets
      const endpoint =
        currentUser?.role === "admin" ? "/support/tickets/all" : "/support/tickets";
      const res = await api.get(endpoint);
      setTickets(res.data?.tickets || []);
    } catch (err) {
      alert("Failed to send reply. Please try again.");
    }
  };

  const handleStatusChange = async (ticketId: number, newStatus: SupportTicket["status"]) => {
    try {
      await api.patch(`/support/tickets/${ticketId}`, { status: newStatus });
      setStatuses((prev) => ({ ...prev, [ticketId]: newStatus }));

      // Refresh tickets
      const endpoint =
        currentUser?.role === "admin" ? "/support/tickets/all" : "/support/tickets";
      const res = await api.get(endpoint);
      setTickets(res.data?.tickets || []);
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
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
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Support Center
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          View your support tickets or create a new one. We typically respond within 24 hours.
        </p>
      </div>

      {/* Create Ticket Button (only for regular users) */}
      {currentUser?.role !== "admin" && (
        <div className="text-right mb-6 max-w-5xl mx-auto">
          <Button
  onClick={() =>
    openModal({
      title: "Create New Ticket",
      content: <CreateTicketForm onSuccess={closeModal} />,
    })
  }
  className="!bg-[#0A66C2] !hover:bg-[#084d93]"
>
  Create Ticket
</Button>
        </div>
      )}

      {/* Tickets List */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          {currentUser?.role === "admin" ? "All Support Tickets" : "Your Support Tickets"}
        </h2>

        {loadingTickets ? (
          <ComponentCard className="p-8 text-center">
            <p className="text-gray-600">Loading tickets...</p>
          </ComponentCard>
        ) : tickets.length === 0 ? (
          <ComponentCard className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No support tickets yet.
              {currentUser?.role !== "admin" && " Create one to get started!"}
            </p>
          </ComponentCard>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const currentStatus = statuses[ticket.ticketId] || ticket.status;
              const isOpen = openTicketId === ticket.ticketId;

              return (
                <ComponentCard key={ticket.ticketId} className="overflow-hidden">
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleTicket(ticket.ticketId)}
                    className="w-full text-left px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {ticket.subject}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ticket #{ticket.ticketId}
                        {currentUser?.role === "admin" && ticket.user
                          ? ` • ${ticket.user.name} (${ticket.user.email})`
                          : ""}
                        {" • "}Opened {formatDate(ticket.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          currentStatus
                        )}`}
                      >
                        {currentStatus.replace("_", " ").charAt(0).toUpperCase() +
                          currentStatus.replace("_", " ").slice(1)}
                      </span>
                      <svg
                        className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div className="p-6 bg-white dark:bg-gray-900">
                      {/* Conversation */}
                      <div className="max-h-96 overflow-y-auto space-y-6 mb-8">
                        {/* Original Message */}
                        <div className="flex justify-end">
                          <div className="max-w-lg">
                            <div className="bg-[#0A66C2] text-white rounded-l-2xl rounded-tr-2xl px-5 py-3 shadow">
                              <p className="whitespace-pre-wrap">{ticket.message}</p>
                            </div>
                            <p className="text-xs text-gray-500 text-right mt-2">
                              You • {formatDate(ticket.created_at)}
                            </p>
                          </div>
                        </div>

                        {/* Replies */}
                        {ticket.replies.map((reply) => (
                          <div
                            key={reply.replyId}
                            className={`flex ${reply.is_admin ? "justify-start" : "justify-end"}`}
                          >
                            <div className="max-w-lg">
                              <div
                                className={`rounded-2xl px-5 py-3 shadow ${
                                  reply.is_admin
                                    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    : "bg-[#0A66C2] text-white"
                                } ${reply.is_admin ? "rounded-r-2xl rounded-tl-2xl" : "rounded-l-2xl rounded-tr-2xl"}`}
                              >
                                <p className="text-sm font-medium mb-1">
                                  {reply.is_admin ? "Support Team" : "You"}
                                </p>
                                <p className="whitespace-pre-wrap">{reply.message}</p>
                              </div>
                              <p
                                className={`text-xs text-gray-500 mt-2 ${
                                  reply.is_admin ? "text-left" : "text-right"
                                }`}
                              >
                                {formatDate(reply.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Admin: Status Update */}
                      {currentUser?.role === "admin" && (
                        <div className="mb-6">
                          <label className="block text-sm font-medium mb-2">
                            Ticket Status
                          </label>
                          <select
                            value={currentStatus}
                            onChange={(e) =>
                              handleStatusChange(
                                ticket.ticketId,
                                e.target.value as SupportTicket["status"]
                              )
                            }
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      )}

                      {/* Reply Box (only if not closed/resolved) */}
                      {(currentStatus === "open" || currentStatus === "in_progress") && (
                        <div className="flex gap-3">
                          <textarea
                            value={replyMessages[ticket.ticketId] || ""}
                            onChange={(e) =>
                              handleReplyChange(ticket.ticketId, e.target.value)
                            }
                            rows={3}
                            placeholder="Type your reply..."
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                          />
                          <div className="flex items-end">
                            <Button
                              onClick={() => handleReplySubmit(ticket.ticketId)}
                              className="px-6 py-3 bg-[#0A66C2] hover:bg-[#084d93] rounded-xl"
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Closed Message */}
                      {(currentStatus === "resolved" || currentStatus === "closed") && (
                        <div className="text-center py-4 text-green-700 dark:text-green-400 font-medium">
                          This ticket is {currentStatus === "resolved" ? "resolved" : "closed"}.
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

      {/* Create Ticket Modal */}
            {/* Create Ticket Modal - Fixed Version */}
      
    </div>
  );
}