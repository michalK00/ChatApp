import { Component, Input, inject } from "@angular/core";
import { RtcService } from "../../../shared/rtc.service";
import { RoomService } from "../../../../shared/room.service";

@Component({
  selector: "app-call-request-bubble",
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col w-fit max-w-[240px] leading-1.5 p-4 border-gray-200 bg-gray-700 rounded-e-xl rounded-es-xl">
      <div class="text-sm font-normal py-1  break-words text-white flex gap-2 items-center justify-center">
        <span>{{ from }} is calling you</span>
        <div class="relative flex items-center justify-center">
          <span
            class="absolute animate-ping rounded-full w-6 h-6 flex items-center justify-center group bg-gray-500 hover:bg-gray-200 "
          ></span>
          <button
            (click)="initCall()"
            id="menu-button"
            class="relative rounded-full w-10 h-10 flex items-center justify-center group hover:bg-gray-200 hover:text-gray-700"
          >
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
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class CallRequestBubbleComponent {
  rtcService = inject(RtcService);
  roomService = inject(RoomService);

  @Input({ required: true }) from!: string;
  @Input({ required: true }) text!: string;

  initCall() {
    this.roomService.callRequestMessages.set([]);
    this.rtcService.rtcConnection.set({ isInitializer: false, callStatus: "Calling", initializerId: this.text });
  }
}
