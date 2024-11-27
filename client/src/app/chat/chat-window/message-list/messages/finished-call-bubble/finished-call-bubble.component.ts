import { DatePipe, NgClass } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-finished-call-bubble",
  standalone: true,
  imports: [NgClass, DatePipe],
  template: `
    <div [ngClass]="alignmentClasses()" class="flex items-start gap-2.5">
      <div [ngClass]="bubbleBodyClasses()" class="flex flex-col w-fit max-w-[240px] leading-1.5 p-4 border-gray-200">
        <div class="flex items-center space-x-2 rtl:space-x-reverse">
          <span [ngClass]="primaryTextClasses()" class="text-sm font-semibold ">{{ from }}</span>
          <span [ngClass]="secondaryTextClasses()" class="text-sm font-normal">{{ timestamp | date : "hh:mm" }} </span>
        </div>
        <div
          [ngClass]="primaryTextClasses()"
          class="text-sm font-normal py-1 text-gray-900 break-words flex justify-center items-center"
        >
          @if (myMessage) { You called
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6 ml-3"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M20.25 3.75v4.5m0-4.5h-4.5m4.5 0-6 6m3 12c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z"
            />
          </svg>
          } @else {
          {{ from }} called you
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6 ml-3"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0 6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z"
            />
          </svg>
          }
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class FinishedCallBubbleComponent {
  @Input({ required: true }) from!: string;
  @Input({ required: true }) timestamp!: Date;
  @Input({ required: true }) myMessage!: boolean;

  alignmentClasses(): string {
    return this.myMessage ? "justify-end" : "justify-start";
  }

  bubbleBodyClasses(): string {
    return this.myMessage ? "bg-gray-100 rounded-s-xl rounded-ee-xl" : "bg-gray-700 rounded-e-xl rounded-es-xl";
  }

  primaryTextClasses(): string {
    return this.myMessage ? "text-gray-900" : "text-white";
  }

  secondaryTextClasses(): string {
    return this.myMessage ? "text-gray-600" : "text-gray-400";
  }
}
