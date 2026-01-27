"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useApiManager from "@/hooks/useApiManager";
import { setAuthTokenPair } from "@/lib/session";
import { AuthResponseDto, LoginDto } from "@/types/api.schemas";
import { ApiResponse } from "@/types/general";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/* -----------------------------
   Schema
------------------------------ */
const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;


const LoginForm = ()=> {
  const router = useRouter();
  const queryClient = useQueryClient()
  const {mutation,isLoading,} = useApiManager<ApiResponse<AuthResponseDto>,undefined,LoginDto>({
    endpoint:"/auth/login",
    method:"POST",
  })

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    mutation.mutate(values,{
      onSuccess(data){
        setAuthTokenPair(data.data.data.accessToken,data.data.data.refreshToken,data.data.data.refreshTokenExpires)
        toast.success(`Welcome ${data.data.data.user.name}`)
        queryClient.invalidateQueries({})
        router.push("/dashboard")
      }
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-2">

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your@email.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

             

                <Button disabled={isLoading} loading={isLoading}  className="w-full" >
                Sign in
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LoginForm