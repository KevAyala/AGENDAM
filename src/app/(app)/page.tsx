import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/current-user";

const ACCESOS = [
  { href: "/pacientes", titulo: "Pacientes", desc: "Registrar y buscar pacientes." },
  { href: "/agenda", titulo: "Agenda", desc: "Ver y crear citas por médico." },
  { href: "/configuracion/horarios", titulo: "Horarios", desc: "Configurar el horario laboral de cada médico." },
];

export default async function Home() {
  const { authUser, usuario } = await obtenerUsuarioActual();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-brand-azul-funcional)]">
          Hola{usuario ? `, ${usuario.nombre.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-black/50">
          Sesión iniciada como <strong>{authUser.email}</strong>
          {usuario && (
            <>
              {" "}· rol <strong>{usuario.rol}</strong>
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ACCESOS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-lg border border-[var(--color-border)] p-5 transition-colors hover:border-[var(--color-brand-azul-funcional)]"
          >
            <div className="text-sm font-semibold text-[#1a1a1a]">{a.titulo}</div>
            <p className="mt-1 text-xs text-black/50">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
