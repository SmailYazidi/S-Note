import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/", // Redirect to home page for sign-in (where LoginForm is rendered)
  },
  callbacks: {
    async session({ session, token }) {
      // Add user ID to session if needed
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      // Persist the OAuth access_token and other data to the JWT
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
})

export { handler as GET, handler as POST }
