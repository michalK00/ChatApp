import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../../auth/shared/auth.service";
import { AuthStatus } from "../../auth/shared/auth.interface";

export const isAuthenticatedGuard = (): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isTokenValid()) {
      return true;
    } else {
      localStorage.removeItem("token");
    }

    router.navigate(["login"]);
    return false;
  };
};
