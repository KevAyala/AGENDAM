"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { registrarBitacora } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function iniciarSesion(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    console.error("[login] Supabase auth error:", error?.status, error?.code, error?.message);
    redirect("/login?error=credenciales");
  }

  // RF-080: registrar el login en la bitácora. Si el usuario de Supabase
  // Auth existe pero todavía no tiene fila en `usuarios` (alta manual
  // pendiente por un Admin), no se bloquea el login pero tampoco se
  // registra la bitácora sin un usuarioId válido.
  const usuario = await prisma.usuario.findUnique({ where: { id: data.user.id } });
  if (usuario) {
    await registrarBitacora({ usuarioId: usuario.id, accion: "login" });
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
