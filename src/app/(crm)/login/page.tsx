import { redirect } from "next/navigation";

export default function LoginAliasRedirect() {
  redirect("/admin/login");
}

