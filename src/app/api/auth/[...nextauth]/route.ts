import NextAuth from 'next-auth'
import { createClient } from '~/lib/supabase/server'

const handler = NextAuth({
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        const supabase = createClient()
        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (user) {
          session.user.id = user.id
          session.user.email = user.email
          session.user.name = user.user_metadata?.name
          session.user.role = user.user_metadata?.role
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error'
  }
})

export { handler as GET, handler as POST }
