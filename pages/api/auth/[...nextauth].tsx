import NextAuth from "next-auth";
import prisma from "../../../lib/prisma";
import { Session } from "../../../lib/auth";

export default NextAuth({
  session: {
    jwt: true,
  },
  debug: true,
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error", // Error code passed in query string as ?error=
  },
  providers: [
    // Providers.Credentials({
    //   name: "Calendso",
    //   credentials: {
    //     email: { label: "Email Address", type: "email", placeholder: "john.doe@example.com" },
    //     password: { label: "Password", type: "password", placeholder: "Your super secure password" },
    //   },
    //   async authorize(credentials) {
    //     const user = await prisma.user.findFirst({
    //       where: {
    //         email: credentials.email,
    //       },
    //     });

    //     if (!user) {
    //       throw new Error("No user found");
    //     }
    //     if (!user.password) {
    //       throw new Error("Incorrect password");
    //     }

    //     const isValid = await verifyPassword(credentials.password, user.password);

    //     if (!isValid) {
    //       throw new Error("Incorrect password");
    //     }

    //     return {
    //       id: user.id,
    //       username: user.username,
    //       email: user.email,
    //       name: user.name,
    //       image: user.avatar,
    //     };
    //   },
    // }),
    {
      id: "yac",
      name: "Yac",
      type: "oauth",
      version: "2.0",
      scope: "",
      params: { grant_type: "authorization_code" },
      accessTokenUrl: "https://integrations.yac.com/api/oauth/token?response_type=oauth-compliant",
      authorizationUrl: "https://integrations.yac.com/api/oauth/authorize",
      profileUrl: "https://integrations.yac.com/api/oauth/me",
      protection: "state",
      async profile(profile) {
        // You can use the tokens, in case you want to fetch more profile information
        // For example several OAuth providers do not return email by default.
        // Depending on your provider, will have tokens like `access_token`, `id_token` and or `refresh_token`
        const yacProfileData: {
          id: number;
          username: string;
          realName: string;
          token: string;
          secret: string;
        } = (profile as any).data;
        const yacSessionData = (
          (await (
            await fetch(`http://api-v3.yacchat.com/api/v2/users/${yacProfileData.id}/session`, {
              method: "GET",
              headers: {
                authorization: yacProfileData.token,
                "Content-Type": "application/json",
              },
            })
          ).json()) || {}
        ).sessionData as { image: string; email: string };
        const { id, realName: name, username, email, image } = { ...yacSessionData, ...yacProfileData };

        await prisma.user.upsert({
          where: { id },
          update: {
            username,
            email,
          },
          create: {
            id,
            username,
            email,
            emailVerified: new Date(Date.now()),
          },
        });
        return {
          id,
          name,
          username,
          email,
          image,
        };
      },
      clientId: process.env.YAC_INTEGRATION_CLIENT_ID || "",
      clientSecret: process.env.YAC_INTEGRATION_CLIENT_SECRET || "",
    },
  ],
  callbacks: {
    async jwt(token, user) {
      // Add username to the token right after signin
      if (user?.username) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session(session, token) {
      const calendsoSession: Session = {
        ...session,
        user: {
          ...session.user,
          id: token.id as number,
          username: token.username as string,
        },
      };
      return calendsoSession;
    },
  },
});
