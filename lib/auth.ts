import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { User } from 'next-auth';

export const { handlers, signIn, signOut, auth } = NextAuth({
  // NextAuth.js v5 utilise AUTH_SECRET automatiquement
  // Mais on le passe explicitement pour éviter les problèmes en production
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/');
      const isOnLoginPage = nextUrl.pathname.startsWith('/login');
      const isOnRegisterPage = nextUrl.pathname.startsWith('/register');
      const isOnVerifyPage = nextUrl.pathname.startsWith('/verify-email');
      
      // Permettre l'accès aux pages publiques
      if (isOnLoginPage || isOnRegisterPage || isOnVerifyPage) {
        return true;
      }
      
      // Protéger toutes les autres routes
      if (isOnDashboard && !isLoggedIn) {
        return false; // Redirigé vers /login par NextAuth
      }
      
      return true;
    }
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Import dynamique pour éviter l'erreur Edge Runtime
        const { getUserByEmail } = await import('@/lib/db');
        const { verifyPassword } = await import('@/lib/password');
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis');
        }

        const user = await getUserByEmail(credentials.email as string);

        if (!user) {
          throw new Error('Aucun utilisateur trouvé avec cet email');
        }

        if (!user.emailVerified) {
          throw new Error('Veuillez vérifier votre email avant de vous connecter');
        }

        const isPasswordValid = await verifyPassword(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Mot de passe incorrect');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.image
        } as User;
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  trustHost: true
});
