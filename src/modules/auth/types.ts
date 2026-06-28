import { Role } from "@prisma/client";

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface AuthUserSession {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: Role;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUserSession;
  error?: string;
}
