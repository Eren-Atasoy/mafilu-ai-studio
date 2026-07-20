import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: `${t.auth.signUp} | ${t.common.appName}` };

export default function SignUpPage() {
  return (
    <AuthCard
      title={t.auth.signUpTitle}
      subtitle={t.auth.signUpSubtitle}
      operation="YENİ_KAYIT"
      footerText={t.auth.hasAccount}
      footerLinkHref="/giris"
      footerLinkLabel={t.auth.signIn}
    >
      <SignUpForm />
    </AuthCard>
  );
}
