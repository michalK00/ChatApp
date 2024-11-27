import { DatePipe, NgClass } from "@angular/common";
import { Component, Input, inject, input, model } from "@angular/core";
import { RoomService } from "../../shared/room.service";
import { Room, RoomWithLastMessage } from "../../shared/room";
import { RtcService } from "../../chat-window/shared/rtc.service";
import { AuthService } from "../../../auth/shared/auth.service";

@Component({
  selector: "app-chat-list-element",
  standalone: true,
  imports: [NgClass, DatePipe],
  template: `
    <button
      [disabled]="this.rtcService.rtcConnection().callStatus !== 'Inactive'"
      class="flex gap-2 text-gray-700 h-12 items-center p-2 overflow-hidden w-full text-left disabled:text-gray-500 "
      [ngClass]="{
        ' hover:bg-gray-200 disabled:hover:bg-white': this.roomService.currentRoom()?.roomId !== this.room().roomId,
        'bg-gray-200 hover:bg-gray-300 disabled:hover:bg-gray-200': this.roomService.currentRoom()?.roomId === this.room().roomId
      }"
      (click)="joinRoom({ roomId: this.room().roomId, roomName: this.room().roomName })"
    >
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
      <div class="flex flex-col justify-evenly w-full">
        <span class="flex justify-between w-full">
          <span class="">{{ this.room().roomName }}</span>
          <span class="text-sm text-gray-400 mt-0.5">{{
            this.room().lastMessage ? (this.room().lastMessage!.timestamp | date : "hh:mm") : ""
          }}</span></span
        >
        <span class="text-xs text-gray-400 truncate max-w-44">{{ buildLastMessageInfo() }}</span>
      </div>
    </button>
  `,
  styles: ``,
})
export class ChatListElementComponent {
  roomService = inject(RoomService);
  authService = inject(AuthService);
  rtcService = inject(RtcService);
  room = model.required<RoomWithLastMessage>();

  joinRoom(room: Room) {
    if (this.roomService.currentRoom()?.roomId === room.roomId) {
      return;
    }
    if (this.roomService.currentRoom() !== null) {
      this.roomService.changeRoom(room);
    } else {
      this.roomService.joinRoom(room);
    }
  }

  buildLastMessageInfo(): string {
    const author =
      this.room().lastMessage?.author === this.authService.currentUserSig()?.nickname ? "You" : this.room().lastMessage?.author;
    return this.room().lastMessage ? `${author}: ${this.room().lastMessage!.content}` : ``;
  }
}
