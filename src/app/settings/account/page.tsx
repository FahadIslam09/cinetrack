import { redirect } from "next/navigation";
import { getAccountSecurityInfo } from "@/actions/account";
import { AccountSecurityView } from "@/components/settings/account-security-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Account & Security · CineTrack",
};

export default async function SettingsAccountPage() {
  const securityInfo = await getAccountSecurityInfo();

  if (!securityInfo) {
    redirect("/login?next=/settings/account");
  }

  return <AccountSecurityView initialInfo={securityInfo} />;
}
