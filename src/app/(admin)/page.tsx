import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "ClickInvoice | The powerful invoicing app",
  description: "ClickInvoice is the simple, powerful platform for freelancers and businesses to create professional invoices, track payments, and get paid faster — without the hassle.",
};

export default function SignIn() {
  return <SignInForm />;
}
