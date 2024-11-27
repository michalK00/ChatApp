import { Component, Input } from "@angular/core";
import { ChatMessageType } from "../message";

@Component({
  selector: "app-info-bubble",
  standalone: true,
  imports: [],
  template: `
    <div class="flex items-start gap-2.5 justify-center">
      <div class="leading-1.5 p-">
        <p class="text-sm font-normal py-2.5 text-gray-400 ">
          {{ from }} {{ action() }} the chat
        </p>
      </div>
    </div>
  `,
  styles: ``,
})
export class InfoBubbleComponent {
  @Input({ required: true }) type!: ChatMessageType;
  @Input({ required: true }) from!: string;

  action(): string {
    if (this.type == "CONNECT") {
      return "joined";
    } else {
      return "left";
    }
  }
}
