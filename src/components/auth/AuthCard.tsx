import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { t } from "@/lib/i18n";

interface AuthCardProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkHref: string;
  footerLinkLabel: string;
  children: React.ReactNode;
}

export function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkHref,
  footerLinkLabel,
  children,
}: AuthCardProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <p className="mb-2 text-2xl font-bold tracking-tight text-primary">
            {t.common.appName}
          </p>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {footerText}{" "}
            <Link href={footerLinkHref} className="font-medium text-primary underline-offset-4 hover:underline">
              {footerLinkLabel}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
