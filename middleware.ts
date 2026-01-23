import proxy from "@/proxy";
import { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  return proxy(req);
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
