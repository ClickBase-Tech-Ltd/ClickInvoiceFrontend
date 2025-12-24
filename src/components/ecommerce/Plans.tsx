// app/plans/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import api from "../../../lib/api";
import { getUserEmail } from "../../../lib/auth";

// Checkmark for available features
function CheckSVG({ className }: { className?: string }) {
  return (
    <svg className={className || "w-6 h-6 text-green-500 flex-shrink-0"} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Cross for unavailable features
function CrossSVG({ className }: { className?: string }) {
  return (
    <svg className={className || "w-6 h-6 text-red-500 flex-shrink-0"} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface PlanFeature {
  text: string;
  available: boolean;
}

interface Plan {
  id: string | number;
  name: string;
  price: number;
  features: PlanFeature[];
  isPopular?: boolean;
  currencySymbol: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  // Load Flutterwave script only on client
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).FlutterwaveCheckout) return;

    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await api.get("/plans");
        const rawPlans = res.data;

        const processedPlans: Plan[] = rawPlans.map((raw: any) => {
          let rawFeatures = raw.features || "";

          // Clean the string: remove outer quotes if present
          if (typeof rawFeatures === "string") {
            let cleaned = rawFeatures.trim();
            if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
              cleaned = cleaned.slice(1, -1);
            }
            rawFeatures = cleaned;
          }

          // Split by ", " but handle the ✓ or ✗ prefix
          const featureStrings = rawFeatures
            .split('", "')
            .map((f: string) => f.replace(/^"|"$/g, "").trim())
            .filter((f: string) => f.length > 0);

          // Parse each feature: check if it starts with ✗ or \u2717 (cross)
          const features: PlanFeature[] = featureStrings.map((feature: string) => {
            const hasCross = feature.startsWith("✗") || feature.startsWith("\u2717");
            const text = feature.replace(/^✗|\u2717\s*/, "").trim(); // remove ✗ and whitespace
            return {
              text,
              available: !hasCross,
            };
          });

          const price = parseFloat(raw.price);
          const isFree = price === 0;

          return {
            id: raw.planId,
            name: raw.planName,
            price: isFree ? 0 : price,
            features,
            isPopular: raw.isPopular === 1 || raw.isPopular === true,
            currencySymbol: "₦",
          };
        });

        setPlans(processedPlans);
      } catch (err) {
        console.error("Failed to load plans:", err);
        setError("Could not load pricing plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

//   const userEmail = "customer@example.com"; // Replace with real user email from auth
const userEmail = getUserEmail();

  const handleUpgrade = (plan: Plan) => {
    if (!(window as any).FlutterwaveCheckout) {
      alert("Payment system is still loading. Please try again.");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
    if (!publicKey) {
      alert("Payment configuration missing. Please contact support.");
      return;
    }

    // Don't process free plans
    if (plan.price === 0) {
      alert("This is the free plan. No payment required!");
      return;
    }

    setProcessingPlan(plan.id.toString());

    (window as any).FlutterwaveCheckout({
      public_key: publicKey,
      tx_ref: `plan-${plan.id}-${Date.now()}`,
      amount: plan.price,
      currency: "NGN",
      payment_options: "card,banktransfer,ussd",
      customer: { email: userEmail },
      customizations: {
        title: `${plan.name} Plan`,
        description: `Upgrade to ${plan.name} plan`,
      },
      meta: { plan_id: plan.id },
      onclose: () => setProcessingPlan(null),
      callback: (response: any) => {
        console.log("Payment completed:", response);
        alert("Payment successful! Your plan has been upgraded.");
        setProcessingPlan(null);
        // TODO: Verify on backend
      },
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <p className="text-xl text-gray-600">Loading plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Upgrade to unlock more features and grow your business faster.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <ComponentCard
            key={plan.id}
            className={`relative ${plan.isPopular ? "border-2 border-brand-500 shadow-lg" : ""}`}
          >
            {plan.isPopular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                <span className="bg-[#0A66C2] text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{plan.name}</h2>

              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {plan.price === 0 ? "Free" : `${plan.currencySymbol}${plan.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                </span>
                {plan.price > 0 && <span className="text-xl text-gray-500 dark:text-gray-400">/month</span>}
              </div>

              <ul className="mt-8 space-y-4 text-left">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.available ? <CheckSVG /> : <CrossSVG />}
                    <span
                      className={`text-gray-700 dark:text-gray-300 ${
                        !feature.available ? "text-gray-400 line-through" : ""
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
  onClick={() => handleUpgrade(plan)}
  disabled={processingPlan === plan.id.toString() || plan.price === 0}
  className={`mt-8 w-full ${
    plan.isPopular ? "bg-[#0A66C2] hover:bg-brand-500" : ""
  }`}
>
  {processingPlan === plan.id.toString()
    ? "Processing..."
    : plan.price === 0
    ? "Current Plan"
    : "Upgrade Now"}
</Button>
            </div>
          </ComponentCard>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Payments powered by Flutterwave • All paid plans are monthly subscriptions</p>
      </div>
    </div>
  );
}