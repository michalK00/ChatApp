import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { NgClass, NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AuthService } from "../shared/auth.service";
import { LoginRequestBody } from "../shared/auth.interface";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass, RouterLink],
  templateUrl: `./login.component.html`,
  styles: ``,
})
export class LoginComponent {
  authService = inject(AuthService);
  incorrectCredentials = signal<boolean>(false);

  signupLink = "/signup";
  loginForm = new FormGroup({
    email: new FormControl("", {
      validators: [Validators.required, Validators.email],
      updateOn: "blur",
    }),
    password: new FormControl("", {
      validators: [Validators.required],
      updateOn: "blur",
    }),
  });
  get password() {
    return this.loginForm.get("password");
  }
  get email() {
    return this.loginForm.get("email");
  }

  regularLogIn() {
    if (!this.loginForm.valid) {
      return;
    }
    const rawValue = this.loginForm.getRawValue();
    const loginRequestBody: LoginRequestBody = this.mapToLoginRequestBody(rawValue);
    this.authService.login(loginRequestBody, this.incorrectCredentials);
  }

  private mapToLoginRequestBody(rawValue: any): LoginRequestBody {
    return {
      email: rawValue.email || "",
      password: rawValue.password || "",
    };
  }

  ssoLogin() {
    document.location.href = this.authService.getSocialLoginUrl();
  }
}
