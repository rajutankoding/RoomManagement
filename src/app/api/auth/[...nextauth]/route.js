import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch("http://192.168.5.3:3005/api/user/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (!res.ok || !data.user) {
            throw new Error(data.message || "Login gagal");
          }

          // ✅ Pastikan data.user berisi id, email, name, role
          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role, // ⬅️ Penting untuk pengecekan admin
          };
        } catch (err) {
          console.error("Authorize error:", err);
          throw new Error("Email atau password salah");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 hari
  },

  callbacks: {
    async jwt({ token, user }) {
      // Saat login pertama kali
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // Inject data dari JWT ke session
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role; // ⬅️ Bisa dicek di frontend
      }
      return session;
    },
  },

  pages: {
    signIn: "/login", // custom login page
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
