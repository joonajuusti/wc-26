import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "./login-form";
import { redirect, RedirectType } from "next/navigation";

export default async function LoginPage(props: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const { expired } = await props.searchParams;
  const user = await getSessionUser();

  if (!!user) {
    redirect("/predictions", RedirectType.replace);
  }

  return (
    <div className="flex min-w-0 flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <LoginForm sessionExpired={expired === "1"} />
      </div>
    </div>
  );
}
