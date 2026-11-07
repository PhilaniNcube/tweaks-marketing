import { redirect } from "next/navigation";

export default function LegacyAdminCrmRedirect() {
  redirect("/dashboard");
}
