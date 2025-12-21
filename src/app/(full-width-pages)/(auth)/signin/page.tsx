import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Click Invoice | The powerful invoicing app",
  description: "Click Invoice is the simple, powerful platform for freelancers and businesses to create professional invoices, track payments, and get paid faster — without the hassle.",
};

export default function SignIn() {
  return <SignInForm />;
}
