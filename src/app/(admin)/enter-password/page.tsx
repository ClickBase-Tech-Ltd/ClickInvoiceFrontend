import EnterPasswordPage from "@/components/auth/EnterPassword";
import ForgotPasswordForm from "@/components/auth/ForgotPassword";
import SetupPasswordPage from "@/components/auth/SetupPassword";
import { Metadata } from "next";
// import SetupPasswordPage from "../../../components/auth/SetupPassword";

export const metadata: Metadata = {
  title:
    "ClickInvoice | The powerful invoicing app",
  description: "ClickInvoice is the simple, powerful platform for freelancers and businesses to create professional invoices, track payments, and get paid faster — without the hassle.",
};

export default function ForgotPassword() {
  return <EnterPasswordPage />;
}
