import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthService } from "../auth/shared/auth.service";

@Component({
  selector: "app-landing",
  standalone: true,
  imports: [RouterLink],
  templateUrl: `./landing.component.html`,
  styles: ``,
})
export class LandingComponent {
  signupLink = "/signup";
  loginLink = "/login";
  roomLink = "/room";

  authService = inject(AuthService);
}
