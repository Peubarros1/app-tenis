import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CourtType, SurfaceType } from "@/generated/prisma/client";
import { PrismaCourtRepository } from "@/infrastructure/persistence/prisma/court-repository";
import { auth } from "@/lib/auth";

function parseEnum<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

function parseEnumList<T extends string>(values: string[], allowed: readonly T[]): T[] {
  return values.filter((value): value is T => (allowed as readonly string[]).includes(value));
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const params = request.nextUrl.searchParams;

  const query = params.get("q")?.trim() || undefined;
  const neighborhood = params.get("neighborhood")?.trim() || undefined;
  const courtType = parseEnumList(params.getAll("courtType"), Object.values(CourtType));
  const surfaceType = parseEnum(params.get("surfaceType"), Object.values(SurfaceType));
  const lightedOnly = params.get("lighted") === "1";
  const maxPriceParam = params.get("maxPrice");
  const maxPriceCents =
    maxPriceParam && Number.isFinite(Number(maxPriceParam))
      ? Math.round(Number(maxPriceParam) * 100)
      : undefined;

  const courts = await new PrismaCourtRepository().search(
    { query, neighborhood, courtType, surfaceType, lightedOnly, maxPriceCents },
    session?.user?.id,
  );

  return NextResponse.json({ courts });
}
