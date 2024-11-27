import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AuthService } from "./auth/shared/auth.service";
import { AuthStatus } from "./auth/shared/auth.interface";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="bg-abstract bg-cover bg-no-repeat bg-center  h-dvh ">
      <router-outlet />
    </div>
  `,
  styles: [],
})
export class AppComponent {
  title = "ZTW_chat_frontend";
}
