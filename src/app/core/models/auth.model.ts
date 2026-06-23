export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  email: string;
  role: string;
  law_office_id: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  lawOfficeId: string;
}
