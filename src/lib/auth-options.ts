import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateUser } from "@/modules/auth/service";
import { getRequiredEnv } from "@/lib/env";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "NIP / Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("NIP/Email dan Password wajib diisi");
        }

        // Dapatkan IP address jika tersedia
        const ipAddress =
          (req?.headers?.["x-forwarded-for"] as string) || "127.0.0.1";

        const result = await authenticateUser(
          {
            identifier: credentials.identifier,
            password: credentials.password,
          },
          ipAddress
        );

        if (!result.success || !result.user) {
          throw new Error(result.error || "Gagal masuk ke sistem");
        }

        return {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          employeeId: result.user.employeeId,
          role: result.user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 jam
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const appUser = user as typeof user & { employeeId?: string; role?: string };
        token.id = user.id;
        token.employeeId = appUser.employeeId || "";
        token.role = appUser.role || "EMPLOYEE";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & {
          id?: string;
          employeeId?: string;
          role?: string;
        };
        sessionUser.id = typeof token.id === "string" ? token.id : "";
        sessionUser.employeeId = typeof token.employeeId === "string" ? token.employeeId : "";
        sessionUser.role = typeof token.role === "string" ? token.role : "EMPLOYEE";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: getRequiredEnv("NEXTAUTH_SECRET"),
};
