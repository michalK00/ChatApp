import { Component, inject } from "@angular/core";
import { AuthService } from "../../auth/shared/auth.service";

@Component({
  selector: "app-account-window",
  standalone: true,
  imports: [],
  template: `
    <div class="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-48 h-48"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
      <button
        class="w-10 h-10 rounded-full bg-gray-200 hover:border hover:border-gray-700 absolute top-3/4 transform -translate-y-1/2 left-3/4 flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-7 h-7"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
          />
        </svg>
      </button>
    </div>
    <div class="flex flex-col gap-2">
      <span class="font-bold text-2xl text-center sm:text-left">{{ nickname }}</span>
      <span class="text-sm text-center sm:text-left">{{ email }}</span>
      <button
        class="w-full p-2 rounded-lg border-0 ring-1 ring-inset text-gray-700 ring-gray-300 hover:ring-violet-400 hover:ring-2 flex items-center justify-center gap-1"
      >
        <span class="align-middle">Change password</span>
      </button>
      <button
        class="w-full p-2 rounded-lg border-0 ring-1 ring-inset text-gray-700 ring-gray-300 hover:ring-violet-400 hover:ring-2 flex items-center justify-center gap-1"
        (click)="logout()"
      >
        <span class="align-middle">Log out</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
          />
        </svg>
      </button>
    </div>
  `,
  styles: ``,
})
export class AccountWindowComponent {
  authService = inject(AuthService);

  nickname = this.authService.currentUserSig()!!.nickname;
  email = this.authService.currentUserSig()!!.email;

  logout() {
    this.authService.logout();
  }
}
