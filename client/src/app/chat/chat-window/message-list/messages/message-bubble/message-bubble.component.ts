import { DatePipe, NgClass } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-message-bubble",
  standalone: true,
  imports: [NgClass, DatePipe],
  template: ` <div [ngClass]="alignmentClasses()" class="flex items-start gap-2.5">
    <div
      [ngClass]="bubbleBodyClasses()"
      class="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200"
    >
      <div class="flex items-center space-x-2 rtl:space-x-reverse">
        <span [ngClass]="primaryTextClasses()" class="text-sm font-semibold ">{{
          from
        }}</span>
        <span [ngClass]="secondaryTextClasses()" class="text-sm font-normal"
          >{{ timestamp | date : "hh:mm" }}
        </span>
      </div>
      <p
        [ngClass]="primaryTextClasses()"
        class="text-sm font-normal py-1 text-gray-900 break-words"
      >
        {{ text }}
      </p>
    </div>
  </div>`,
  styles: ``,
})
export class MessageBubbleComponent {
  @Input({ required: true }) from!: string;
  @Input({ required: true }) text!: string;
  @Input({ required: true }) timestamp!: Date;
  @Input({ required: true }) myMessage!: boolean;

  alignmentClasses(): string {
    return this.myMessage ? "justify-end" : "justify-start";
  }

  bubbleBodyClasses(): string {
    return this.myMessage
      ? "bg-gray-100 rounded-s-xl rounded-ee-xl"
      : "bg-gray-700 rounded-e-xl rounded-es-xl";
  }

  primaryTextClasses(): string {
    return this.myMessage ? "text-gray-900" : "text-white";
  }

  secondaryTextClasses(): string {
    return this.myMessage ? "text-gray-600" : "text-gray-400";
  }
}
