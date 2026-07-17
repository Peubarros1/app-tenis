"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use-error";
import { RegisterUser } from "@/application/use-cases/register-user";
import { signIn } from "@/lib/auth";
import { PrismaUserRepository } from "@/infrastructure/persistence/prisma/user-repository";
import { registerSchema } from "@/lib/validation/auth";

export async function registerAction(formData: FormData) {
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (password !== confirmPassword) {
    redirect(`/registro?error=${encodeURIComponent("As senhas não coincidem.")}`);
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password,
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    redirect(`/registro?error=${encodeURIComponent(message)}`);
  }

  const registerUser = new RegisterUser(new PrismaUserRepository());

  try {
    await registerUser.execute(parsed.data);
  } catch (error) {
    if (error instanceof EmailAlreadyInUseError) {
      redirect(`/registro?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/conta",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login");
    }
    throw error;
  }
}
