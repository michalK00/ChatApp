import { NgClass } from "@angular/common";
import { Component, HostListener, ElementRef, inject, signal } from "@angular/core";
import { RoomService } from "../../shared/room.service";
import { ManageRoomModalComponent } from "./add-members-modal/manage-room-modal.component";
import { RtcService } from "../shared/rtc.service";

@Component({
  selector: "app-chat-header",
  standalone: true,
  imports: [NgClass, ManageRoomModalComponent],
  template: `
    <div class="flex gap-2 text-gray-700 w-full h-full ">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-12 h-12"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
      <div class="flex flex-col justify-evenly">
        <span class="line-clamp-1">{{ this.roomService.currentRoom()!.roomName }}</span>
      </div>
    </div>
    <div class="flex gap-2 text-gray-700 items-center ">
      @if (roomService.currentRoomParticipants().length <= 2) {

      <!-- <button
        (click)="initiateAudioCall()"
        [ngClass]="disableHeaderClasses()"
        [disabled]="!isRTCInactive()"
        class="rounded-full w-10 h-10 flex items-center justify-center group enabled:hover:bg-gray-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6 group-enabled:group-hover:fill-gray-700"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
          />
        </svg>
      </button> -->

      <button
        (click)="initiateVideoCall()"
        [ngClass]="disableHeaderClasses()"
        [disabled]="!isRTCInactive()"
        class="rounded-full w-10 h-10 flex items-center justify-center group enabled:hover:bg-gray-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6 group-enabled:group-hover:fill-gray-700"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      </button>
      }
      <div class="relative inline-block text-left">
        <button
          (click)="toggleDropdown()"
          id="menu-button"
          class="rounded-full w-10 h-10 flex items-center justify-center group enabled:hover:bg-gray-200"
          [ngClass]="disableHeaderClasses()"
          [disabled]="!isRTCInactive()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6 group-enabled:group-hover:fill-gray-700"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
        </button>
        <div
          class="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          [ngClass]="this.dropdownActive ? '' : 'hidden'"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabindex="-1"
        >
          <button
            (click)="toggleManagingRoom()"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
            role="menuitem"
            tabindex="-1"
            id="menu-item-0"
          >
            Manage room
          </button>
          <button
            (click)="leaveRoom()"
            class="px-4 py-2 text-sm text-red-600 flex gap-1 items-center hover:bg-gray-200 w-full text-left"
            role="menuitem"
            tabindex="-1"
            id="menu-item-1"
          >
            Leave room
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
    @if (isManagingRoom()) {
    <app-manage-room-modal [(isManagingRoom)]="isManagingRoom" (managedRoom)="getRooms()" />
    }
  `,
  styles: ``,
})
export class ChatHeaderComponent {
  roomService = inject(RoomService);
  rtcService = inject(RtcService);

  isManagingRoom = signal<boolean>(false);

  leaveRoom() {
    this.roomService.leaveRoom(this.roomService.currentRoom()!.roomId);
  }

  dropdownActive: boolean = false;

  constructor(private eRef: ElementRef) {}

  toggleDropdown() {
    this.dropdownActive = !this.dropdownActive;
  }

  @HostListener("document:click", ["$event"])
  clickout(event: Event) {
    if (this.eRef.nativeElement.contains(event.target)) {
      return;
    }
    if (this.dropdownActive) {
      this.toggleDropdown();
    }
  }

  toggleManagingRoom() {
    this.dropdownActive = false;
    this.isManagingRoom.update((v) => !v);
  }

  getRooms() {
    this.roomService.getUserRooms().subscribe((rooms) => {
      this.roomService.userRooms.set(rooms);
    });
  }

  isRTCInactive() {
    return this.rtcService.rtcConnection().callStatus === "Inactive";
  }

  disableHeaderClasses() {
    return this.isRTCInactive() ? "" : "disabled:opacity-75 disabled:cursor-default";
  }

  initiateVideoCall() {
    this.rtcService.rtcConnection.set({ isInitializer: true, callStatus: "Calling", initializerId: "" });
  }
}
