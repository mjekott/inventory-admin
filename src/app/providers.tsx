
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { PropsWithChildren } from "react";
import { Toaster } from "sonner";


const queryClient = new QueryClient();

const Provider = ({ children }: PropsWithChildren) => {
  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
          {children}
          <Toaster richColors position="top-center" expand />
      </QueryClientProvider>
    </NuqsAdapter>
  );
};

export default Provider;