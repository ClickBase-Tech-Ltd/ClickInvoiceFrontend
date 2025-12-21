import { Metadata } from "next";
import SetupPasswordPage from "../../../../components/auth/SetupPassword";

export const metadata: Metadata = {
  title:
    "Click Invoice | The powerful invoicing app",
  description: "Click Invoice is the simple, powerful platform for freelancers and businesses to create professional invoices, track payments, and get paid faster — without the hassle.",
};

export default function SignIn() {
  return <SetupPasswordPage />;
}
