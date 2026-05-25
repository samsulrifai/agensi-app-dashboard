import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "worker" | "admin";
      avatarUrl?: string | null;
    };
  }

  interface User {
    id: string;
    role: "worker" | "admin";
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "worker" | "admin";
    avatarUrl?: string | null;
  }
}
