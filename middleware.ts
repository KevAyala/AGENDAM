import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // `/api/*` queda fuera a propósito: el webhook de Twilio (Fase 3) y el
  // cron de confirmaciones no tienen sesión de Supabase — antes de este
  // cambio el middleware los redirigía a /login (307) y nunca se
  // ejecutaban. Esas rutas validan su propio acceso (firma de Twilio,
  // CRON_SECRET) en vez de depender de este middleware.
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
