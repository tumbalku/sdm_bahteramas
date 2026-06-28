import { signIn, signOut } from "next-auth/react";
import { LoginCredentials } from "./types";

export async function loginApi(credentials: LoginCredentials) {
  const result = await signIn("credentials", {
    identifier: credentials.identifier,
    password: credentials.password,
    redirect: false,
    callbackUrl: "/dashboard",
  });

  if (result?.error) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
  };
}

export async function logoutApi() {
  await signOut({ callbackUrl: "/login" });
}
