import { Component, inject } from "@angular/core";
import { AuthService } from "../../shared/auth.service";

@Component({
  selector: "app-oauth-redirect",
  standalone: true,
  imports: [],
  template: ``,
  styles: ``,
})
export class OauthRedirectComponent {
  authService = inject(AuthService);

  ngOnInit() {
    const accessToken = this.extractUrlParameter("token");
    if (accessToken) {
      this.authService.loginWithToken(accessToken);
    }
  }

  extractUrlParameter(key: string) {
    return new URLSearchParams(location.search).get(key);
  }
}
