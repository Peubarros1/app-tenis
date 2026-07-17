"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AddCourtReview } from "@/application/use-cases/add-court-review";
import { CreateBooking } from "@/application/use-cases/create-booking";
import { AppError } from "@/domain/errors/app-error";
import { PrismaBookingRepository } from "@/infrastructure/persistence/prisma/booking-repository";
import { PrismaCourtRepository } from "@/infrastructure/persistence/prisma/court-repository";
import { auth } from "@/lib/auth";
import { recifeWallClockToDate } from "@/lib/datetime";
import { createBookingSchema } from "@/lib/validation/booking";
import { courtReviewSchema } from "@/lib/validation/court";

export async function addCourtReviewAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const courtId = formData.get("courtId");
  if (typeof courtId !== "string" || !courtId) return;

  const parsed = courtReviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    redirect(`/quadras/${courtId}?error=${encodeURIComponent(message)}`);
  }

  const addCourtReview = new AddCourtReview(new PrismaCourtRepository());
  await addCourtReview.execute(courtId, session.user.id, parsed.data);

  revalidatePath(`/quadras/${courtId}`);
  redirect(`/quadras/${courtId}`);
}

export async function createBookingAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const courtId = formData.get("courtId");
  if (typeof courtId !== "string" || !courtId) return;

  const parsed = createBookingSchema.safeParse({
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    durationMinutes: formData.get("durationMinutes"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    redirect(`/quadras/${courtId}?bookingError=${encodeURIComponent(message)}`);
  }

  const startTime = recifeWallClockToDate(parsed.data.date, parsed.data.startTime);
  const endTime = new Date(startTime.getTime() + parsed.data.durationMinutes * 60_000);

  const createBooking = new CreateBooking(
    new PrismaCourtRepository(),
    new PrismaBookingRepository(),
  );

  try {
    await createBooking.execute(courtId, session.user.id, {
      startTime,
      endTime,
      notes: parsed.data.notes || null,
    });
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/quadras/${courtId}?bookingError=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath(`/quadras/${courtId}`);
  revalidatePath("/reservas");
  redirect(`/quadras/${courtId}?bookingSuccess=1`);
}
