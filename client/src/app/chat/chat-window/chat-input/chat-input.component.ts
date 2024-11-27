import { Component, WritableSignal, inject, input, model, signal } from "@angular/core";
import { ChatMessage } from "../../chat-window/message-list/messages/message";
import { ReactiveFormsModule, FormGroup, FormControl } from "@angular/forms";
import { throttleTime } from "rxjs";
import { RoomService } from "../../shared/room.service";
import { AuthService } from "../../../auth/shared/auth.service";

@Component({
  selector: "app-chat-input",
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="chatForm" (ngSubmit)="sendMessage($event)" class="flex gap-1 w-full md:w-4/6 px-2">
      <input
        formControlName="message"
        class="w-full rounded-md border-0 py-0.5 px-2 text-gray-700 ring-1 ring-inset bg-gray-50 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-400 sm:text-sm sm:leading-6"
        placeholder="Aa"
      />
      <!-- TODO add attachment functionality -->
      <!-- <button class="rounded-full min-w-8 h-8 flex items-center justify-center group hover:bg-gray-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5 text-gray-700"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
          />
        </svg>
      </button> -->
      <button class="rounded-full min-w-8 h-8 flex items-center justify-center group hover:bg-gray-200" type="submit">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5 text-gray-700"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
          />
        </svg>
      </button>
    </form>
  `,
  styles: ``,
})
export class ChatInputComponent {
  roomService = inject(RoomService);
  authService = inject(AuthService);

  newMessage = model.required<ChatMessage | null>();
  chatForm = new FormGroup({
    message: new FormControl(""),
  });

  sendMessage($event: Event) {
    $event.preventDefault();
    const message = this.chatForm.get("message")!.value;
    if (!message) {
      return;
    }
    this.newMessage.set({
      message: message,
      type: "CHAT",
      from: this.authService.currentUserSig()!.nickname,
      timestamp: new Date(),
      roomId: this.roomService.currentRoom()!.roomId,
    });
    this.chatForm.reset();
  }
  ngOnInit() {
    this.chatForm
      .get("message")!
      .valueChanges.pipe(throttleTime(1500))
      .subscribe((messageValue) => {
        if (!messageValue) {
          return;
        }
        this.newMessage.set({
          message: "",
          type: "TYPING",
          from: this.authService.currentUserSig()!.nickname,
          timestamp: new Date(),
          roomId: this.roomService.currentRoom()!!.roomId,
        });
      });
  }
}
