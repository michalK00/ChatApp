import { ChangeDetectorRef, Component, effect, inject, signal } from "@angular/core";
import { RoomService } from "./shared/room.service";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { ChatWindowComponent } from "./chat-window/chat-window.component";
import { NgIf } from "@angular/common";
import { AccountWindowComponent } from "./account-window/account-window.component";
import { AuthService } from "../auth/shared/auth.service";

@Component({
  selector: "app-room",
  standalone: true,
  template: `
    <div class="flex items-center justify-center h-screen">
      <div
        class="bg-white shadow-inner flex flex-col md:flex-row rounded-lg h-2/3 w-11/12 lg:w-9/12 xl:w-8/12 divide-slate-200 divide-y md:divide-x "
      >
        <app-sidebar [(sidebarMode)]="sidebarMode" class="w-full md:w-4/12 2xl:w-1/4" />
        <app-chat-window *ngIf="sidebarMode() === 'CHAT'" class="w-full md:w-8/12 2xl:w-3/4 h-full" />
        <app-account-window
          *ngIf="sidebarMode() === 'MYACCOUNT'"
          class="flex flex-col sm:flex-row gap-2 text-gray-700 justify-center items-center h-full w-full md:w-8/12 2xl:w-3/4"
        />
        <!-- } -->
      </div>
    </div>
  `,
  styles: ``,
  imports: [SidebarComponent, ChatWindowComponent, NgIf, AccountWindowComponent],
})
export class ChatComponent {
  roomService = inject(RoomService);
  authService = inject(AuthService);

  constructor() {
    effect(
      () => {
        if (this.authService.currentUserSig() && !this.roomService.isConnected()) {
          this.roomService.connect();
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnDestroy() {
    this.roomService.destroySubscription(this.roomService.generalSubscription()!);
  }

  cdRef = inject(ChangeDetectorRef);
  sidebarMode = signal<SidebarMode>("CHAT");
}
export type SidebarMode = "CHAT" | "MYACCOUNT";
