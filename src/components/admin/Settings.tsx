"use client";
import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import api from "../../../lib/api";

interface PaymentGateway {
  id: string;
  name: string;
  // Add other fields if needed
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface PlanPrices {
  basic: number;
  premium: number;
}

interface SettingsData {
  defaultGateway: string;
  gatewayKeys: {
    [gatewayId: string]: {
      publicKey: string;
      secretKey: string;
    };
  };
  planPrices: PlanPrices;
  supportedCurrencies: string[]; // array of currency codes
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [settings, setSettings] = useState<SettingsData>({
    defaultGateway: "",
    gatewayKeys: {},
    planPrices: { basic: 0, premium: 0 },
    supportedCurrencies: [],
  });

  const [selectedGateway, setSelectedGateway] = useState<string>("");

  // Fetch all required data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gatewaysRes, currenciesRes, settingsRes] = await Promise.all([
          api.get("/payment-gateways"), // Endpoint to get list of gateways
          api.get("/currencies"),             // Endpoint for currencies
          api.get("/admin/settings"),         // Current settings + default prices
        ]);

        const gatewaysData: PaymentGateway[] = gatewaysRes.data;
        const currenciesData: Currency[] = currenciesRes.data;
        const currentSettings: SettingsData = settingsRes.data;

        setGateways(gatewaysData);
        setCurrencies(currenciesData);
        setSettings(currentSettings);

        // Set initial selected gateway
        if (currentSettings.defaultGateway && gatewaysData.length > 0) {
          setSelectedGateway(currentSettings.defaultGateway);
        } else if (gatewaysData.length > 0) {
          setSelectedGateway(gatewaysData[0].id);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGatewayChange = (gatewayId: string) => {
    setSettings((prev) => ({ ...prev, defaultGateway: gatewayId }));
    setSelectedGateway(gatewayId);
  };

  const handleKeyChange = (gatewayId: string, field: "publicKey" | "secretKey", value: string) => {
    setSettings((prev) => ({
      ...prev,
      gatewayKeys: {
        ...prev.gatewayKeys,
        [gatewayId]: {
          ... (prev.gatewayKeys[gatewayId] || { publicKey: "", secretKey: "" }),
          [field]: value,
        },
      },
    }));
  };

  const handlePriceChange = (plan: "basic" | "premium", value: string) => {
    const numValue = parseFloat(value) || 0;
    setSettings((prev) => ({
      ...prev,
      planPrices: {
        ...prev.planPrices,
        [plan]: numValue,
      },
    }));
  };

  const handleCurrencyToggle = (code: string) => {
    setSettings((prev) => ({
      ...prev,
      supportedCurrencies: prev.supportedCurrencies.includes(code)
        ? prev.supportedCurrencies.filter((c) => c !== code)
        : [...prev.supportedCurrencies, code],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/admin/settings", settings);
      alert("Settings saved successfully!");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const currentKeys = settings.gatewayKeys[selectedGateway] || { publicKey: "", secretKey: "" };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h2 className="mb-8 text-2xl font-bold text-gray-800 dark:text-white/90">
        Admin Settings
      </h2>

      <div className="space-y-10">
        {/* Payment Gateway Settings */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Payment Gateway Configuration
          </h3>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <Label>Default Payment Gateway</Label>
              <select
                value={settings.defaultGateway}
                onChange={(e) => handleGatewayChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select a gateway</option>
                {gateways.map((gw) => (
                  <option key={gw.id} value={gw.id}>
                    {gw.name}
                  </option>
                ))}
              </select>
            </div>

            <div /> {/* Spacer */}
          </div>

          {selectedGateway && (
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <Label>Public Key</Label>
                <input
                  type="text"
                  value={currentKeys.publicKey}
                  onChange={(e) => handleKeyChange(selectedGateway, "publicKey", e.target.value)}
                  placeholder="pk_live_xxxxxxxxxxxxxxxx"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <Label>Secret Key</Label>
                <input
                  type="password"
                  value={currentKeys.secretKey}
                  onChange={(e) => handleKeyChange(selectedGateway, "secretKey", e.target.value)}
                  placeholder="sk_live_xxxxxxxxxxxxxxxx"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          )}
        </section>

        {/* Plan Pricing */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Subscription Plan Pricing
          </h3>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <Label>Basic Plan Price (per month)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.planPrices.basic}
                  onChange={(e) => handlePriceChange("basic", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <Label>Premium Plan Price (per month)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.planPrices.premium}
                  onChange={(e) => handlePriceChange("premium", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Supported Currencies */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Supported Currencies
          </h3>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {currencies.map((currency) => {
              const isSelected = settings.supportedCurrencies.includes(currency.code);
              return (
                <label
                  key={currency.code}
                  className={`flex cursor-pointer items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCurrencyToggle(currency.code)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    {currency.symbol} {currency.code}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="!bg-[#0A66C2] hover:!bg-[#084d93] px-8 py-3 text-base"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}