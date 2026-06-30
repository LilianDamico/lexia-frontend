export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  officeName: string;
  confirmPassword?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  email: string;
  role: string;
  lawOfficeId: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  lawOfficeId: string;
}
