import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateUser } from "@/modules/auth/service";

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
        token.id = user.id;
        token.employeeId = (user as any).employeeId;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).employeeId = token.employeeId;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-key",
};
