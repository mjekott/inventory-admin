"use client";

import { Input } from "@/components/ui/input";

import SubmitButton from "../button-action";
import { useActionState } from "react";
import { signup } from "./signup-actions";

export function SignUp() {
  const [state, loginAction] = useActionState(signup, undefined);
  return (
    <div className="w-full max-w-md space-y-2">
      <form action={loginAction} className="space-y-4">
        <div className="space-y-2 mt-7">
          <Input name="firstname" id="firstname" placeholder="Jonathan" />
          {state?.fieldErrors?.email && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>
        <div className="space-y-2 mt-7">
          <Input name="email" id="email" placeholder="Email" />
          {state?.fieldErrors?.email && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Input name="password" id="password" placeholder="Password" />
          {state?.fieldErrors?.password && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
