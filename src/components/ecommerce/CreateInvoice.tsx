"use client";

import React, { useEffect, useMemo, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import api from "../../../lib/api";
import Icon from "@/components/Icons";

/* ---------------- types ---------------- */
interface Item {
  itemDescription: string;
  amount: number;
}

interface Currency {
  currencyId: number;
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
}

interface Customer {
  customerId: number;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
}

/* ---------------- success modal ---------------- */
function InvoiceSuccessModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-2">Invoice Created</h3>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Your invoice has been created successfully.
        </p>
        <Button
          onClick={() => {
            onClose();
            window.history.back();
          }}
          className="w-full"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}

/* ---------------- error modal ---------------- */
// function ErrorModal({
//   isOpen,
//   message,
//   onClose,
// }: {
//   isOpen: boolean;
//   message: string;
//   onClose: () => void;
// }) {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
//       <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
//         <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
//         <p className="mb-6 text-gray-700 dark:text-gray-300">{message}</p>
//         <Button onClick={onClose} className="w-full" variant="outline">
//           Close
//         </Button>
//       </div>
//     </div>
//   );
// }


function ErrorModal({ isOpen, message, onClose }: { isOpen: boolean; message: string; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 dark:bg-black/40 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
/* ---------------- page ---------------- */
export default function CreateInvoicePage() {
  /* ---------------- tenant defaults ---------------- */
  const tenantDefaultCurrencyId = "";
  const tenantDefaultCurrencySymbol = "";

  /* ---------------- state ---------------- */
  const [items, setItems] = useState<Item[]>([
    { itemDescription: "", amount: 0 },
  ]);

  const [form, setForm] = useState({
    userInvoiceId: "",
    projectName: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    taxPercentage: "",
    amountPaid: 0,
    bank: "",
    accountName: "",
    accountNumber: "",
    notes: "",
    currency: tenantDefaultCurrencyId,
  });

  /* ---------------- customers ---------------- */
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">("");

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
  });

  /* ---------------- currency ---------------- */
  const [useCustomCurrency, setUseCustomCurrency] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /* ---------------- error state ---------------- */
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ---------------- load customers ---------------- */
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await api.get("/customers/tenant");
        setCustomers(res.data);
      } catch {
        console.error("Failed to load customers");
      } finally {
        setLoadingCustomers(false);
      }
    };
    loadCustomers();
  }, []);

  /* ---------------- load currencies ---------------- */
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const res = await api.get("/currencies");
        setCurrencies(res.data);
      } catch {
        console.error("Failed to load currencies");
      } finally {
        setLoadingCurrencies(false);
      }
    };
    loadCurrencies();
  }, []);

  /* ---------------- calculations ---------------- */
  const subTotal = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.amount || 0), 0),
    [items]
  );

  const taxAmount = useMemo(() => {
    if (!form.taxPercentage) return 0;
    return subTotal * (Number(form.taxPercentage) / 100);
  }, [subTotal, form.taxPercentage]);

  const totalWithTax = subTotal + taxAmount;
  const balanceDue = totalWithTax - Number(form.amountPaid || 0);

  /* ---------------- item handlers ---------------- */
  const addItem = () =>
    setItems([...items, { itemDescription: "", amount: 0 }]);

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (
    index: number,
    field: keyof Item,
    value: string
  ) => {
    const updated = [...items];
    updated[index][field] =
      field === "amount" ? Number(value) : value;
    setItems(updated);
  };

  /* ---------------- add customer ---------------- */
  const handleAddCustomer = async () => {
    if (!newCustomer.customerName) {
      setErrorMessage("Customer name is required");
      return;
    }

    try {
      const res = await api.post("/customers/tenant", newCustomer);
      setCustomers((prev) => [...prev, res.data]);
      setSelectedCustomerId(res.data.customerId);
      setShowAddCustomer(false);
      setNewCustomer({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        customerAddress: "",
      });
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Failed to add customer");
    }
  };

  /* ---------------- submit ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        invoiceId: `INV-${Date.now()}`,
        userGeneratedInvoiceId: form.userInvoiceId || null,
        projectName: form.projectName,
        invoiceDate: form.invoiceDate,
        dueDate: form.dueDate || null,
        customerId: selectedCustomerId,
        taxPercentage: form.taxPercentage || null,
        amountPaid: Number(form.amountPaid) || 0,
        currency: useCustomCurrency ? Number(form.currency) : undefined,
        bank: form.bank,
        accountName: form.accountName,
        accountNumber: form.accountNumber,
        notes: form.notes,
        items,
      };

      await api.post("/invoices", payload);
      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Something went wrong while creating the invoice"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => history.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm"
      >
        {/* <ChevronLeftIcon className="w-5 h-5" /> */}
         <Icon src={ChevronLeftIcon} className="w-5 h-5"/>
        Return
      </button>

      <ComponentCard title="Create Invoice">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... [rest of the form fields remain unchanged] ... */}

          {/* Invoice ID */}
          <div>
            <Label>Invoice ID (Optional)</Label>
            <Input
              value={form.userInvoiceId}
              onChange={(e) =>
                setForm({ ...form, userInvoiceId: e.target.value })
              }
            />
          </div>

          {/* Project */}
          <div>
            <Label>Project / Title</Label>
            <Input
              value={form.projectName}
              onChange={(e) =>
                setForm({ ...form, projectName: e.target.value })
              }
              required
            />
          </div>

          {/* Customer */}
          <div>
            <Label>Bill To (Customer)</Label>
            <div className="flex gap-3">
              <select
                className="w-full px-4 py-3 border rounded-lg"
                value={selectedCustomerId}
                onChange={(e) =>
                  setSelectedCustomerId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                required
              >
                <option value="">
                  {loadingCustomers
                    ? "Loading customers..."
                    : "Select customer"}
                </option>
                {customers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.customerName}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddCustomer(true)}
              >
                + Add
              </Button>
            </div>
          </div>

          {/* Items */}
          <div>
            <Label>Invoice Items</Label>
            {items.map((item, i) => (
              <div key={i} className="grid md:grid-cols-3 gap-4 mt-3">
                <Input
                  placeholder="Description"
                  value={item.itemDescription}
                  onChange={(e) =>
                    updateItem(i, "itemDescription", e.target.value)
                  }
                  required
                />
                <Input
                  type="number"
                  step="0.01"
                  value={item.amount}
                  onChange={(e) =>
                    updateItem(i, "amount", e.target.value)
                  }
                  required
                  placeholder="Amount"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-red-600 text-xl"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="mt-3 text-sm text-brand-500"
            >
              + Add item
            </button>
          </div>

          {/* Tax & Payment */}
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Tax % (e.g. 7.5)"
              value={form.taxPercentage}
              onChange={(e) =>
                setForm({ ...form, taxPercentage: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Amount Paid"
              value={form.amountPaid}
              onChange={(e) =>
                setForm({ ...form, amountPaid: Number(e.target.value) })
              }
            />
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded text-sm">
            <p>Subtotal: {subTotal.toFixed(2)}</p>
            <p>Tax: {taxAmount.toFixed(2)}</p>
            <p className="font-semibold">
              Balance Due: {balanceDue.toFixed(2)}
            </p>
          </div>

          {/* Bank */}
          <div className="grid md:grid-cols-3 gap-6">
            <Input
              placeholder="Bank"
              required
              onChange={(e) =>
                setForm({ ...form, bank: e.target.value })
              }
            />
            <Input
              placeholder="Account Name"
              required
              onChange={(e) =>
                setForm({ ...form, accountName: e.target.value })
              }
            />
            <Input
              placeholder="Account Number"
              value={form.accountNumber}
              inputMode="numeric"
              autoComplete="off"
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
                setForm({ ...form, accountNumber: digitsOnly });
              }}
              required
            />
          </div>

          {/* Notes */}
          <textarea
            className="w-full p-3 border rounded"
            placeholder="Notes (optional)"
            onChange={(e) =>
              setForm({ ...form, notes: e.target.value })
            }
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Save & Send"}
          </Button>
        </form>
      </ComponentCard>

      {/* Modals */}
      <InvoiceSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />

      <ErrorModal
        isOpen={!!errorMessage}
        message={errorMessage || "An unknown error occurred"}
        onClose={() => setErrorMessage(null)}
      />
      

      {/* Add customer modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Add Customer</h3>

            <Input
              placeholder="Customer Name"
              value={newCustomer.customerName}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  customerName: e.target.value,
                })
              }
            />
            <Input
              placeholder="Phone"
              value={newCustomer.customerPhone}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  customerPhone: e.target.value,
                })
              }
            />
            <Input
              placeholder="Email"
              value={newCustomer.customerEmail}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  customerEmail: e.target.value,
                })
              }
            />
            <textarea
              className="w-full p-3 border rounded"
              placeholder="Address"
              value={newCustomer.customerAddress}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  customerAddress: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddCustomer(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddCustomer}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}