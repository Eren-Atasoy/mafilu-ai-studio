import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: `${t.auth.signIn} | ${t.common.appName}` };

export default function SignInPage() {
  return (
    <AuthCard
      title={t.auth.signInTitle}
      subtitle={t.auth.signInSubtitle}
      operation="OTURUM_AÇ"
      footerText={t.auth.noAccount}
      footerLinkHref="/kayit"
      footerLinkLabel={t.auth.signUp}
    >
      <SignInForm />
    </AuthCard>
  );
}
