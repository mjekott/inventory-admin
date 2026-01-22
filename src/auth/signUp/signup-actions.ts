import { SignUpSchema } from "@/lib/validations/auth";
import { LoginState } from "@/types/inventory";
import { redirect } from "next/navigation";

export async function signup(
  prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const dataObject = Object.fromEntries(formData);

  const result = SignUpSchema.safeParse(dataObject);

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  redirect("/");
}
