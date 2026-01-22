import { apiRequest } from "@/hooks/use-api-client";
import { createSession, deleteSessiion } from "@/lib/session";
import { loginSchema } from "@/lib/validations/auth";
import { LoginResponse, LoginState } from "@/types/inventory";
import { toast } from "sonner";

export async function login(
  prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const data = Object.fromEntries(formData.entries()) as Record<string, string>;

  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const response = await apiRequest<LoginResponse>("POST", "/auth/login", {
      data: parsed.data,
    });

    if (!response?.data?.user) {
      return {
        formError: response?.message || "Invalid email or password",
      };
    }

    const { user, accessToken, refreshToken, refreshTokenExpires } =
      response.data;

    await createSession({
      userId: user.id,
      role: user.role.code,
      accessToken,
      refreshToken,
      expiresAt: new Date(refreshTokenExpires),
    });
    toast(response.message, { position: "top-center" });
    return { success: true };
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return { formError: "Invalid email or password" };
  }
}

export async function logout() {
  await deleteSessiion();
}
