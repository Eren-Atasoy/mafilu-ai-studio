"use client";

import { useActionState } from "react";
import { signIn, type AuthFormState } from "@/app/(auth)/actions";
import { t } from "@/lib/i18n";

const initialState: AuthFormState = { error: null };

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="lp-label">
          &gt; {t.auth.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="lp-input"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="lp-label">
          &gt; {t.auth.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          className="lp-input"
        />
      </div>
      {state.error && (
        <p role="alert" className="lp-alert">
          <span className="lp-alert-prefix">! HATA:</span>
          {state.error}
        </p>
      )}
      <button type="submit" className="lp-btn lp-btn--solid w-full justify-center" disabled={isPending}>
        {isPending ? (
          <>
            İŞLENİYOR
            <span className="lp-cursor" />
          </>
        ) : (
          t.auth.signIn
        )}
      </button>
    </form>
  );
}
