"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CancelBooking } from "@/application/use-cases/cancel-booking";
import { AppError } from "@/domain/errors/app-error";
import { PrismaBookingRepository } from "@/infrastructure/persistence/prisma/booking-repository";
import { auth } from "@/lib/auth";

export async function cancelBookingAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const bookingId = formData.get("bookingId");
  if (typeof bookingId !== "string" || !bookingId) return;

  const cancelBooking = new CancelBooking(new PrismaBookingRepository());

  try {
    await cancelBooking.execute(bookingId, session.user.id);
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/reservas?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath("/reservas");
  redirect("/reservas");
}
