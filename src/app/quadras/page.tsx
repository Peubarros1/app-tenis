import type { Metadata } from "next";
import { PrismaCourtRepository } from "@/infrastructure/persistence/prisma/court-repository";
import { auth } from "@/lib/auth";
import { QuadrasExplorer } from "./_components/quadras-explorer";

export const metadata: Metadata = {
  title: "Quadras de tênis em Recife",
  description:
    "Encontre quadras de tênis públicas e privadas em Recife: mapa, preço, piso, iluminação e avaliações.",
};

export default async function QuadrasPage() {
  const session = await auth();
  const initialCourts = await new PrismaCourtRepository().search({}, session?.user?.id);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <QuadrasExplorer initialCourts={initialCourts} />
    </div>
  );
}
