import { AfterViewChecked, Component, ElementRef, HostListener, ViewChild, effect, inject, signal } from "@angular/core";
import { MessageListComponent } from "./message-list/message-list.component";
import { ChatInputComponent } from "./chat-input/chat-input.component";
import { RoomService } from "../shared/room.service";
import { ChatMessage, ChatMessageDTO } from "./message-list/messages/message";
import { ChatHeaderComponent } from "./chat-header/chat-header.component";
import { RtcService } from "./shared/rtc.service";
import { ChatCallComponent } from "./chat-call/chat-call.component";
import { delay } from "rxjs";

@Component({
  selector: "app-chat-window",
  standalone: true,
  template: `
    <div class="flex flex-col justify-center items-center h-full divide-y w-full">
      @if (roomService.currentRoom() !== null) {

      <app-chat-header class="w-full min-h-3/12 flex justify-between p-2" />
      @if (this.rtcService.rtcConnection().callStatus === "Inactive") {
      <app-message-list
        (scroll)="onScroll($event)"
        #scrollContainer
        class="flex flex-col gap-3 overflow-scroll h-full w-full shadow-inner px-2"
      ></app-message-list>
      <app-chat-input [(newMessage)]="newMessage" class="flex justify-center py-2 w-full "></app-chat-input>
      } @else {
      <app-chat-call class="flex flex-col justify-center items-center w-full h-full rounded-bl-md relative" />
      } } @else {

      <span>Join or create a new room</span>
      }
    </div>
  `,
  styles: ``,
  imports: [MessageListComponent, ChatInputComponent, ChatHeaderComponent, ChatCallComponent],
})
export class ChatWindowComponent implements AfterViewChecked {
  roomService = inject(RoomService);
  rtcService = inject(RtcService);

  newMessage = signal<ChatMessage | null>(null);

  shouldScrollToBottom;
  isLoadingOldMessages;

  constructor() {
    this.shouldScrollToBottom = false;
    this.isLoadingOldMessages = false;
    effect(() => this.loadOldMessagesOnRoomSubscription());
    effect(() => this.handleScrollOnNewMessages());
    effect(() => this.handleSendingNewMessage(), { allowSignalWrites: true });
    effect(() => this.handleScrollAfterCall());
  }

  ngOnInit() {
    this.shouldScrollToBottom = false;
    this.isLoadingOldMessages = false;
  }

  @ViewChild("scrollContainer", { read: ElementRef }) private scrollContainer!: ElementRef;

  private handleScrollAfterCall() {
    this.rtcService.rtcConnection();
    this.shouldScrollToBottom = true;
  }

  @HostListener("window:scroll", ["$event"])
  onScroll(event: any) {
    if (!this.shouldLoadOldMessages()) {
      return;
    }
    this.loadOldMessages();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollChatToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    if (this.roomService.roomSubscription()) {
      this.roomService.destroySubscription(this.roomService.roomSubscription()!);
    }
  }

  private loadOldMessages() {
    this.isLoadingOldMessages = true;
    const startingScrollHeight = this.scrollContainer.nativeElement.scrollHeight;

    this.roomService.getOldMessagesObservable(10).subscribe((response) => {
      if (response.length > 0) {
        this.updateOldMessages(response);
        this.adjustScrollPosition(startingScrollHeight);
      }
    });
  }

  private adjustScrollPosition(startingScrollHeight: number): void {
    setTimeout(() => {
      const newScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
      this.scrollContainer.nativeElement.scrollTo(0, newScrollHeight - startingScrollHeight);
      this.isLoadingOldMessages = false;
    });
  }

  private updateOldMessages(response: ChatMessage[]): void {
    this.roomService.oldMessages.update((messages) => [...response.reverse(), ...messages]);
    this.roomService.oldMessagesPageNumber += 1;
  }

  private handleSendingNewMessage() {
    if (!this.newMessage()) {
      return;
    }
    const messageToSend = this.createMessageToSend();
    this.sendMessage(messageToSend);
    this.resetNewMessageValue();
    this.scrollChatToBottom();
  }

  private createMessageToSend(): ChatMessageDTO {
    const newMessage = this.newMessage()!;
    return {
      type: newMessage.type,
      from: newMessage.from,
      message: newMessage.message,
      timestamp: newMessage.timestamp.toISOString(),
      roomId: this.roomService.currentRoom()!.roomId.toString(),
    };
  }

  private resetNewMessageValue() {
    this.newMessage.set(null);
  }

  private sendMessage(message: ChatMessageDTO): void {
    this.roomService.sendMessage(`/app/sendRoomMessage/${message.roomId}`, message);
  }

  private scrollChatToBottom() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }

  private shouldLoadOldMessages(): boolean {
    return this.hasInitializedOldMessages() && this.isScrollInLoadingArea() && !this.isLoadingOldMessages;
  }

  private isScrollInLoadingArea() {
    return this.scrollContainer.nativeElement.scrollTop < 20;
  }

  private hasInitializedOldMessages() {
    return this.roomService.oldMessages().length !== 0;
  }

  private loadOldMessagesOnRoomSubscription(): void {
    if (this.roomService.roomSubscription()) {
      this.roomService.getOldMessagesObservable(10).subscribe((response) => {
        if (response.length > 0) {
          this.roomService.oldMessages.update((messages) => [...response.reverse(), ...messages]);
          this.roomService.oldMessagesPageNumber += 1;
          setTimeout(() => {
            const newScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
            this.scrollContainer.nativeElement.scrollTo(0, newScrollHeight);
          });
        }
        this.isLoadingOldMessages = false;

        this.roomService.showLoadingMessagesPlaceholder.set(false);
      });
    }
  }

  private handleScrollOnNewMessages(): void {
    this.roomService.messages();
    this.roomService.typingMessages();
    this.roomService.callRequestMessages();
    this.shouldScrollToBottom = true;
  }
}
