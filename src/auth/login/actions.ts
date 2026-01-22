import { createSession, deleteSessiion } from "@/lib/session";
import { loginSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

const testUser = {
  id: "1",
  email: "admin@inventory.com",
  password: "12345678",
};

export async function login(
  prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const dataObject = Object.fromEntries(formData);

  const result = loginSchema.safeParse(dataObject);

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  if (email !== testUser.email || password !== testUser.password) {
    return {
      fieldErrors: {
        email: ["Invalid email or password"],
      },
    };
  }

  await createSession(testUser.id);

  redirect("/dashboard");
}

export async function logout() {
  await deleteSessiion();
}
