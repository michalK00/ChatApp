import { Injectable, Signal, WritableSignal, inject, signal } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { LoginRequestBody, LoginResponse, RegisterRequestBody, AuthStatus, UserDetailsResponse } from "./auth.interface";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  http = inject(HttpClient);
  router = inject(Router);
  currentUserSig = signal<AuthStatus | null>(null);

  constructor() {
    this.setAuthStatus();
  }

  public register(registerRequestBody: RegisterRequestBody) {
    this.requestRegister(registerRequestBody).subscribe({
      next: () => {
        const loginRequestBody: LoginRequestBody = {
          email: registerRequestBody.email,
          password: registerRequestBody.password,
        };
        this.login(loginRequestBody);
      },
      error: () => {
        console.error("Error while registering");
      },
    });
  }

  public login(userLoginFormValue: LoginRequestBody, incorrectCredentials?: WritableSignal<boolean>) {
    this.requestLogin(userLoginFormValue).subscribe({
      next: (response) => {
        localStorage.setItem("token", response.token);
        this.setAuthStatus();
        this.router.navigateByUrl("room");
      },
      error: (response) => {
        if (response.status === 400 && incorrectCredentials) {
          incorrectCredentials.set(true);
        }
        console.error("Error while logging in");
        this.currentUserSig.set(null);
      },
    });
  }

  public getSocialLoginUrl() {
    return `${environment.envVar.API_BASE_URL}/oauth2/authorization/google?redirect_uri=${environment.envVar.OAUTH2_REDIRECT_URI}`;
  }

  public loginWithToken(token: string) {
    localStorage.setItem("token", token);
    this.setAuthStatus();
    this.router.navigateByUrl("room");
  }

  public logout() {
    localStorage.removeItem("token");
    this.currentUserSig.set(null);
    this.router.navigateByUrl("/");
  }

  public isAuthenticated() {
    return this.currentUserSig() !== null;
  }

  private setAuthStatus() {
    const token = localStorage.getItem("token");

    if (!token) {
      this.currentUserSig.set(null);
      return;
    }
    this.requestUserDetails().subscribe({
      next: (response) => {
        const authStatus = {
          id: response.id,
          nickname: response.nickname,
          email: response.email,
          token: token,
        };
        this.currentUserSig.set(authStatus);
      },
      error: () => {
        console.error("Error while setting auth status");
        this.currentUserSig.set(null);
      },
    });
  }

  public isTokenValid() {
    const token = localStorage.getItem("token");
    if (!token) {
      return false;
    }
    const exp = JSON.parse(atob(token.split(".")[1])).exp;
    const now = Math.floor(Date.now() / 1000);

    return now < exp;
  }

  private requestRegister(registerRequestBody: RegisterRequestBody) {
    return this.http.post<HttpResponse<any>>(
      `${environment.envVar.API_BASE_URL}/public/api/v1/auth/register-user`,
      registerRequestBody
    );
  }

  private requestLogin(userLoginFormValue: LoginRequestBody) {
    return this.http.post<LoginResponse>(
      `${environment.envVar.API_BASE_URL}/public/api/v1/auth/authenticate`,
      userLoginFormValue
    );
  }

  private requestUserDetails() {
    return this.http.get<UserDetailsResponse>(`${environment.envVar.API_BASE_URL}/public/api/v1/user-details`);
  }
}
