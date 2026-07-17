"use server";

import { redirect } from "next/navigation";
import { CreateCourt } from "@/application/use-cases/create-court";
import { PrismaCourtRepository } from "@/infrastructure/persistence/prisma/court-repository";
import { auth } from "@/lib/auth";
import {
  createCourtSchema,
  openingHourSchema,
  type OpeningHourInput,
} from "@/lib/validation/court";

export async function createCourtAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const hourlyPrice = formData.get("hourlyPrice");

  const parsed = createCourtSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    courtType: formData.get("courtType"),
    bookingMode: formData.get("bookingMode"),
    surfaceType: formData.get("surfaceType"),
    isLighted: formData.get("isLighted") === "on",
    isIndoor: formData.get("isIndoor") === "on",
    address: formData.get("address"),
    neighborhood: formData.get("neighborhood"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    hourlyPriceCents: hourlyPrice ? Math.round(Number(hourlyPrice) * 100) : undefined,
    officialBookingUrl: formData.get("officialBookingUrl"),
    bookingInstructions: formData.get("bookingInstructions"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    redirect(`/quadras/nova?error=${encodeURIComponent(message)}`);
  }

  const openingHours: OpeningHourInput[] = [];
  for (let day = 0; day <= 6; day++) {
    if (formData.get(`closed_${day}`) === "on") continue;

    const opensAt = formData.get(`opensAt_${day}`);
    const closesAt = formData.get(`closesAt_${day}`);
    if (!opensAt || !closesAt) continue;

    const parsedHour = openingHourSchema.safeParse({ dayOfWeek: day, opensAt, closesAt });
    if (parsedHour.success) openingHours.push(parsedHour.data);
  }

  const photoUrls = formData
    .getAll("photoUrl")
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);

  const createCourt = new CreateCourt(new PrismaCourtRepository());
  const court = await createCourt.execute(session.user.id, parsed.data, photoUrls, openingHours);

  redirect(`/quadras/${court.id}`);
}
