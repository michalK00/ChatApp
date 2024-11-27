export interface RegisterRequestBody {
  nickname: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface AuthStatus {
  id: string;
  nickname: string;
  email: string;
  token: string;
}

export interface UserDetailsResponse {
  id: string;
  nickname: string;
  email: string;
}

export interface LoginResponse {
  token: string;
}
