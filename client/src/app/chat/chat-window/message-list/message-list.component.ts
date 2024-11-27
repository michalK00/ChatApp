import { Component, ElementRef, OnInit, inject, input, model } from "@angular/core";
import { ChatMessage } from "./messages/message";
import { NgFor, NgIf } from "@angular/common";
import { MessageBubbleComponent } from "./messages/message-bubble/message-bubble.component";
import { InfoBubbleComponent } from "./messages/info-bubble/info-bubble.component";
import { TypingBubbleComponent } from "./messages/typing-bubble/typing-bubble.component";
import { RoomService } from "../../shared/room.service";
import { AuthService } from "../../../auth/shared/auth.service";
import { CallRequestBubbleComponent } from "./messages/call-request-bubble/call-request-bubble.component";
import { FinishedCallBubbleComponent } from "./messages/finished-call-bubble/finished-call-bubble.component";
import { LoadingBubblesComponent } from "./messages/loading-bubbles/loading-bubbles.component";

@Component({
  selector: "app-message-list",
  standalone: true,
  template: `
    @if (this.roomService.showLoadingMessagesPlaceholder()) {
    <app-loading-bubbles />
    } @for (message of roomService.oldMessages(); track $index) { @if (message.type === "CHAT") {
    <app-message-bubble
      [from]="message.from"
      [text]="message.message"
      [timestamp]="message.timestamp"
      [myMessage]="message.from === this.authService.currentUserSig()!.nickname"
    />
    } @else if (message.type === "CALL") {
    <app-finished-call-bubble
      [from]="message.from"
      [timestamp]="message.timestamp"
      [myMessage]="message.from === this.authService.currentUserSig()!.nickname"
    />
    } } @for (message of roomService.messages(); track $index) { @if (message.type === "CHAT") {
    <app-message-bubble
      [from]="message.from"
      [text]="message.message"
      [timestamp]="message.timestamp"
      [myMessage]="message.from === this.authService.currentUserSig()!.nickname"
    />
    } @else if (message.type === "CALL") {
    <app-finished-call-bubble
      [from]="message.from"
      [timestamp]="message.timestamp"
      [myMessage]="message.from === this.authService.currentUserSig()!.nickname"
    />
    }@else { <app-info-bubble [type]="message.type" [from]="message.from" /> } } @for (message of
    roomService.callRequestMessages(); track $index) { @if (message.from !== this.authService.currentUserSig()!.nickname) {
    <app-call-request-bubble [from]="message.from" [text]="message.message" />
    } } @for (key of getKeys(roomService.typingMessages()); track $index) { @if (this.authService.currentUserSig()!.nickname !==
    key) {
    <app-typing-bubble [from]="roomService.typingMessages().get(key)!.from" />
    } }
  `,
  styles: ``,
  imports: [
    NgFor,
    NgIf,
    MessageBubbleComponent,
    InfoBubbleComponent,
    TypingBubbleComponent,
    CallRequestBubbleComponent,
    FinishedCallBubbleComponent,
    LoadingBubblesComponent,
  ],
})
export class MessageListComponent {
  roomService = inject(RoomService);
  authService = inject(AuthService);

  getKeys<K, V>(map: Map<K, V>) {
    return Array.from(map.keys());
  }
}
