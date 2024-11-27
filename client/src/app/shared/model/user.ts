export interface User {
  id: number;
  nickname: string;
  email: string;
}

export interface UserWithStatus {
  id: number;
  nickname: string;
  email: string;
  status: string;
}
