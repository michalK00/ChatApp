import { Routes } from "@angular/router";
import { ChatComponent } from "./chat/chat.component";
import { LoginComponent } from "./auth/login/login.component";
import { SignupComponent } from "./auth/signup/signup.component";
import { LandingComponent } from "./landing/landing.component";
import { isAuthenticatedGuard } from "./shared/guards/auth.guard";
import { OauthRedirectComponent } from "./auth/oauth-redirect/oauth-redirect/oauth-redirect.component";

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "home",
  },
  {
    path: "home",
    component: LandingComponent,
  },
  {
    path: "room",
    canActivate: [isAuthenticatedGuard()],
    component: ChatComponent,
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "signup",
    component: SignupComponent,
  },
  {
    path: "oauth2/redirect",
    component: OauthRedirectComponent,
  },
];
