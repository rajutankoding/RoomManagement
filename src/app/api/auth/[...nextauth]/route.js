import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        // 🔒 Validasi user manual (bisa ke database)
        if (
          credentials.email === "admin@example.com" &&
          credentials.password === "1234"
        ) {
          return { id: 1, name: "Admin", email: "admin@example.com" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt", // bisa juga "database"
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
