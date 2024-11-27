import { Component, inject } from "@angular/core";
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { PhoneNumberRegx, StrongPasswordRegx } from "../shared/vars";
import { NgClass, NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AuthService } from "../shared/auth.service";
import { RegisterRequestBody } from "../shared/auth.interface";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass, RouterLink],
  templateUrl: `./signup.component.html`,
  styles: ``,
})
export class SignupComponent {
  loginLink = "/login";

  authService = inject(AuthService);

  signupForm = new FormGroup({
    nickname: new FormControl("", {
      validators: [Validators.required, Validators.maxLength(255)],
      updateOn: "blur",
    }),

    email: new FormControl("", {
      validators: [Validators.required, Validators.email, Validators.maxLength(255)],
      updateOn: "blur",
    }),
    password: new FormControl("", {
      validators: [Validators.required, Validators.pattern(StrongPasswordRegx), Validators.maxLength(255)],
      updateOn: "blur",
    }),
  });
  get password() {
    return this.signupForm.get("password");
  }
  get email() {
    return this.signupForm.get("email");
  }
  get nickname() {
    return this.signupForm.get("nickname");
  }

  regularSignUp() {
    if (this.signupForm.invalid) {
      return;
    }
    const rawValue = this.signupForm.getRawValue();
    const registerRequestBody: RegisterRequestBody = this.mapToRegisterRequestBody(rawValue);

    this.authService.register(registerRequestBody);
  }

  private mapToRegisterRequestBody(rawValue: any): RegisterRequestBody {
    return {
      nickname: rawValue.nickname || "",
      email: rawValue.email || "",
      password: rawValue.password || "",
    };
  }
  ssoSignUp() {
    document.location.href = this.authService.getSocialLoginUrl();
  }
}
