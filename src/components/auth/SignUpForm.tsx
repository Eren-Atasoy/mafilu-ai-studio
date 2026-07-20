"use client";

import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/app/(auth)/actions";
import { t } from "@/lib/i18n";

const initialState: AuthFormState = { error: null };

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="fullName" className="lp-label">
          &gt; {t.auth.fullName}
        </label>
        <input
          id="fullName"
          name="fullName"
          required
          autoComplete="name"
          className="lp-input"
        />
      </div>
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
          autoComplete="new-password"
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
          t.auth.signUp
        )}
      </button>
    </form>
  );
}
