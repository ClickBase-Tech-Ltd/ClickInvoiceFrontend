// app/support/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import api from "../../../lib/api";
import { useModal } from "../../../context/ModalContext";

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
  user?: { name: string; email: string };
}

interface CurrentUser {
  role: "admin" | "user";
}

function CreateTicketForm({ onSuccess }: { onSuccess: () => void }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { closeModal } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setStatus("idle");
    setErrorMsg(null);

    try {
      await api.post("/support/tickets", { subject, message });
      setStatus("success");
      setSubject("");
      setMessage("");
      setTimeout(() => {
        onSuccess();
        closeModal();
      }, 800);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.response?.data?.message || "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "success" && (
        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-center transition-all">
          Ticket created successfully!
        </div>
      )}
      {status === "error" && errorMsg && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-center transition-all">
          {errorMsg}
        </div>
      )}

      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Ticket Subject"
        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
        required
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Describe your issue..."
        rows={5}
        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
        required
      />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="!bg-[#0A66C2] !hover:bg-[#084d93]">
          {isSubmitting ? "Sending..." : "Create Ticket"}
        </Button>
      </div>
    </form>
  );
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [replyMessages, setReplyMessages] = useState<{ [key: number]: string }>({});
  const [replyErrors, setReplyErrors] = useState<{ [key: number]: string }>({});

  const { openModal } = useModal();
  const chatRef = useRef<HTMLDivElement | null>(null);
  const autoFetchInterval = useRef<NodeJS.Timer | null>(null);

  // --- Fetch current user
  const fetchUser = async () => {
    try {
      const res = await api.get("/user");
      setCurrentUser(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch user", err);
      return null;
    }
  };

  // --- Fetch all tickets
  const fetchTickets = async (user?: CurrentUser) => {
    if (!user) return;
    try {
      const endpoint = user.role === "admin" ? "/support/tickets/all" : "/support/tickets";
      const res = await api.get(endpoint);
      setTickets(res.data?.tickets || []);
      if (!selectedTicketId && res.data?.tickets.length > 0) {
        setSelectedTicketId(res.data.tickets[0].ticketId);
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    }
  };

  // --- Fetch only replies for the selected ticket
  const fetchRepliesForTicket = async (ticketId: number) => {
    if (!currentUser) return;
    try {
      const endpoint = currentUser.role === "admin" ? "/support/tickets/all" : "/support/tickets";
      const res = await api.get(endpoint);
      const updatedTicket = res.data?.tickets.find((t: SupportTicket) => t.ticketId === ticketId);
      if (!updatedTicket) return;
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketId === ticketId ? { ...t, replies: updatedTicket.replies, status: updatedTicket.status } : t
        )
      );
    } catch (err) {
      console.error("Failed to fetch ticket replies", err);
    }
  };

  // --- Initialize
  useEffect(() => {
    (async () => {
      const user = await fetchUser();
      await fetchTickets(user);
    })();
  }, []);

  // --- Auto-fetch only replies for selected ticket
  useEffect(() => {
    if (!selectedTicketId || !currentUser) return;
    autoFetchInterval.current = setInterval(() => {
      fetchRepliesForTicket(selectedTicketId);
    }, 10000);
    return () => {
      if (autoFetchInterval.current) clearInterval(autoFetchInterval.current);
    };
  }, [selectedTicketId, currentUser]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

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

  const handleReplyChange = (ticketId: number, value: string) => {
    setReplyMessages((prev) => ({ ...prev, [ticketId]: value }));
    setReplyErrors((prev) => ({ ...prev, [ticketId]: "" }));
  };

  const handleReplySubmit = async (ticketId: number) => {
    const message = replyMessages[ticketId]?.trim();
    if (!message) return;

    try {
      await api.post(`/support/tickets/${ticketId}/reply`, { message });
      setReplyMessages((prev) => ({ ...prev, [ticketId]: "" }));
      setReplyErrors((prev) => ({ ...prev, [ticketId]: "" }));
      await fetchRepliesForTicket(ticketId);
      setTimeout(() => chatRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: any) {
      setReplyErrors((prev) => ({
        ...prev,
        [ticketId]: err?.response?.data?.message || "Failed to send reply. Try again.",
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tickets</h2>
          {currentUser?.role !== "admin" && (
            <Button
              className="!bg-[#0A66C2] !hover:bg-[#084d93]"
              onClick={() =>
                openModal({
                  title: "Create Ticket",
                  content: <CreateTicketForm onSuccess={() => fetchTickets(currentUser)} />,
                })
              }
            >
              New
            </Button>
          )}
        </div>

        <div className="space-y-2 max-h-[75vh] overflow-y-auto">
          {tickets.length === 0 ? (
            <p className="text-gray-500">No tickets available.</p>
          ) : (
            tickets.map((ticket) => (
              <button
                key={ticket.ticketId}
                onClick={() => setSelectedTicketId(ticket.ticketId)}
                className={`w-full text-left px-4 py-3 rounded-lg shadow-sm transition-all duration-300 ${
                  selectedTicketId === ticket.ticketId
                    ? "bg-[#0A66C2] text-white scale-105"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{ticket.subject}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(ticket.created_at)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Selected Ticket */}
      <div className="lg:col-span-2 flex flex-col space-y-6">
        {selectedTicketId ? (
          (() => {
            const ticket = tickets.find((t) => t.ticketId === selectedTicketId);
            if (!ticket) return null;

            return (
              <ComponentCard
                key={ticket.ticketId}
                className="flex flex-col space-y-6 p-6 bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{ticket.subject}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                {/* Conversation */}
                <div className="flex flex-col space-y-4 max-h-[65vh] overflow-y-auto pr-2 animate-fadeIn">
                  <div className="flex justify-end">
                    <div className="max-w-lg">
                      <div className="bg-[#0A66C2] text-white rounded-l-2xl rounded-tr-2xl px-5 py-3 shadow transition-all">
                        {ticket.message}
                      </div>
                      <p className="text-xs text-gray-500 text-right mt-1">
                        You • {formatDate(ticket.created_at)}
                      </p>
                    </div>
                  </div>

                  {ticket.replies.map((reply) => (
                    <div
                      key={reply.replyId}
                      className={`flex ${reply.is_admin ? "justify-start" : "justify-end"} transition-all duration-300`}
                    >
                      <div className="max-w-lg">
                        <div
                          className={`rounded-2xl px-5 py-3 shadow ${
                            reply.is_admin
                              ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-r-2xl rounded-tl-2xl"
                              : "bg-[#0A66C2] text-white rounded-l-2xl rounded-tr-2xl"
                          }`}
                        >
                          <p className="text-sm font-medium mb-1">{reply.is_admin ? "Support Team" : "You"}</p>
                          <p className="whitespace-pre-wrap">{reply.message}</p>
                        </div>
                        <p className={`text-xs mt-1 ${reply.is_admin ? "text-left" : "text-right"}`}>
                          {formatDate(reply.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatRef} />
                </div>

                {/* Reply Box */}
                {(ticket.status === "open" || ticket.status === "in_progress") && (
                  <div className="flex flex-col gap-2 animate-fadeIn">
                    <div className="flex gap-3">
                      <textarea
                        value={replyMessages[ticket.ticketId] || ""}
                        onChange={(e) => handleReplyChange(ticket.ticketId, e.target.value)}
                        rows={3}
                        placeholder="Type your reply..."
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                      />
                      <Button
                        onClick={() => handleReplySubmit(ticket.ticketId)}
                        className="px-6 py-3 !bg-[#0A66C2] !hover:bg-[#084d93] rounded-xl"
                      >
                        Send
                      </Button>
                    </div>
                    {replyErrors[ticket.ticketId] && (
                      <p className="text-sm text-red-600 dark:text-red-400">{replyErrors[ticket.ticketId]}</p>
                    )}
                  </div>
                )}

                {(ticket.status === "resolved" || ticket.status === "closed") && (
                  <div className="text-center py-4 text-green-700 dark:text-green-400 font-medium">
                    This ticket is {ticket.status.toUpperCase()}.
                  </div>
                )}
              </ComponentCard>
            );
          })()
        ) : (
          <ComponentCard className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Select a ticket to view conversation.</p>
          </ComponentCard>
        )}
      </div>
    </div>
  );
}
