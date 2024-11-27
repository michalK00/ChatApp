import { Component, Input } from "@angular/core";

@Component({
  selector: "app-typing-bubble",
  standalone: true,
  imports: [],
  template: `
    <div class="items-start gap-2.5 justify-start">
      <div
        class="flex w-fit h-fit text-nowrap justify-between max-w-wr leading-1.5 p-4 border-gray-200 rounded-e-xl rounded-es-xl bg-gray-700 text-white "
      >
        <span>{{ from }} is typing </span>
        <span
          class="animate-fade animate-infinite animate-duration-1000 animate-ease-in-out text-xl "
          >.</span
        ><span
          class="animate-fade animate-infinite animate-duration-1000 animate-delay-100 animate-ease-in-out text-xl"
          >.</span
        >
        <span
          class="animate-fade animate-infinite animate-duration-1000 animate-delay-200 animate-ease-in-out text-xl"
          >.</span
        >
      </div>
    </div>
  `,
  styles: ``,
})
export class TypingBubbleComponent {
  @Input({ required: true }) from!: string;
}
