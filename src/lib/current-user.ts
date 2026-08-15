import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Sesión + fila de `usuarios` del usuario en turno. Redirige a /login si no
 * hay sesión. `usuario` puede ser `null` si el uid existe en Supabase Auth
 * pero todavía no tiene fila en `usuarios` (alta manual pendiente).
 */
export async function obtenerUsuarioActual() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: authUser.id } });

  return { authUser, usuario };
}
