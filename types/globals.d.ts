import { Role } from "@prisma/client";

export {};

export type Roles = Role;

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
