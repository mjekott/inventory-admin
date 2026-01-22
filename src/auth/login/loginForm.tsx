"use client";

import { useActionState, useEffect } from "react";
import { login } from "./login-actions";

import { Input } from "@/components/ui/input";
import SubmitButton from "../button-action";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const [state, loginAction] = useActionState(login, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.refresh();
      router.push("/dashboard");
    }
  }, [state?.success]);

  return (
    <div className="w-full max-w-md space-y-2">
      <form action={loginAction} className="space-y-4">
        <div className="space-y-2 mt-7">
          <Input name="email" id="email" placeholder="Email" />
          {state?.fieldErrors?.email && (
            <p className="text-sm text-red-500">{state.fieldErrors.email[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Input name="password" id="password" placeholder="Password" />
          {state?.fieldErrors?.password && (
            <p className="text-sm text-red-500">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>
        {state?.formError && (
          <p className="text-sm text-red-500">{state.formError}</p>
        )}
        <SubmitButton />
      </form>
    </div>
  );
};

export default LoginForm;
