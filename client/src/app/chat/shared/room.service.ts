import { Injectable, Signal, computed, inject, signal } from "@angular/core";
import { WebSocketService } from "../../shared/web-socket.service";
import { CallRequest, ChatMessage, ChatMessageDTO } from "../chat-window/message-list/messages/message";
import { interval, Observable, Subscription } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { LastMessage, Room, RoomWithLastMessage } from "./room";
import { AuthService } from "../../auth/shared/auth.service";
import { User, UserWithStatus } from "../../shared/model/user";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class RoomService {
  private websocketService = inject(WebSocketService);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  public currentRoom = signal<Room | null>(null);
  public currentRoomParticipants = signal<UserWithStatus[]>([]);
  public userRooms = signal<RoomWithLastMessage[]>([]);

  public callRequestMessages = signal<CallRequest[]>([]);
  public messages = signal<ChatMessage[]>([]);
  public oldMessages = signal<ChatMessage[]>([]);

  public typingMessages = signal<Map<string, ChatMessage>>(new Map());
  public isConnected: Signal<Boolean> = computed(() => this.websocketService.isConnected());
  public connectionTimestamp = signal<string | undefined>(undefined);
  public roomSubscription = signal<Subscription | undefined>(undefined);
  public generalSubscription = signal<Subscription | undefined>(undefined);
  public showLoadingMessagesPlaceholder = signal<boolean>(true);
  public showLoadingRoomsAnimation = signal<boolean>(true);

  public oldMessagesPageNumber = 0;

  private requestGetRooms(): Observable<RoomWithLastMessage[]> {
    return this.http.get<RoomWithLastMessage[]>(`${environment.envVar.API_BASE_URL}/user-rooms`);
  }

  private requestAddNewRoom(roomName: string) {
    return this.http.post<number>(`${environment.envVar.API_BASE_URL}/new-room`, { roomName: roomName });
  }

  private requestRenameRoom(roomId: number, roomName: string) {
    return this.http.patch(`${environment.envVar.API_BASE_URL}/change-room-name/${roomId}`, { roomName: roomName });
  }

  private requestRoomParticipants(roomId: number) {
    return this.http.get<UserWithStatus[]>(`${environment.envVar.API_BASE_URL}/room-participants/${roomId}`);
  }

  private requestDeleteRoom(roomId: number) {
    return this.http.delete(`${environment.envVar.API_BASE_URL}/leave-room/${roomId}`);
  }

  private requestAddParticipants(roomId: number, userIds: number[]) {
    return this.http.post(`${environment.envVar.API_BASE_URL}/add-to-room/${roomId}`, userIds);
  }

  private requestGetOldMessages(roomId: number, timestamp: string, pageSize: number = 20, pageNumber: number = 0) {
    return this.http.get<ChatMessage[]>(
      `${environment.envVar.API_BASE_URL}/get-old-messages/${roomId}?timestamp=${timestamp}&pageSize=${pageSize}&pageNumber=${pageNumber}`
    );
  }

  public getRoomParticipants(roomId: number): void {
    this.requestRoomParticipants(roomId).subscribe((response) => {
      this.currentRoomParticipants.set(response);
    });
  }

  public getOldMessages(count: number): void {
    this.requestGetOldMessages(
      this.currentRoom()!.roomId,
      this.connectionTimestamp()!,
      count,
      this.oldMessagesPageNumber
    ).subscribe((response) => {
      if (response.length > 0) {
        this.oldMessages.update((messages) => [...response.reverse(), ...messages]);
      }
      this.oldMessagesPageNumber += 1;
    });
  }
  public getOldMessagesObservable(count: number): Observable<ChatMessage[]> {
    return this.requestGetOldMessages(this.currentRoom()!.roomId, this.connectionTimestamp()!, count, this.oldMessagesPageNumber);
  }

  public addParticipants(roomId: number, participants: User[]) {
    const userIds = participants.map((user) => user.id);
    this.requestAddParticipants(roomId, userIds).subscribe(() => {});
  }

  public addNewRoom(roomName: string) {
    return this.requestAddNewRoom(roomName);
  }

  public getUserRooms(): Observable<RoomWithLastMessage[]> {
    return this.requestGetRooms();
  }

  public renameRoom(roomId: number, roomName: string) {
    this.requestRenameRoom(roomId, roomName).subscribe(() => {
      this.currentRoom.set({ roomId, roomName });
      this.getUserRooms().subscribe((response) => {
        this.userRooms.set(response);
      });
    });
  }

  public joinRoom(newRoom: Room) {
    if (!this.isConnected()) {
      this.connect();
    }
    this.currentRoom.set(newRoom);

    this.initializeRoomSubscription();
    // this.websocketService.send(`/app/sendRoomMessage/${newRoom.roomId}`, {
    //   type: "CONNECT",
    //   from: this.authService.currentUserSig()!.nickname,
    //   message: "",
    //   timestamp: new Date().toISOString(),
    //   roomId: newRoom.roomId.toString(),
    // });
  }

  leaveRoom(roomId: number) {
    this.requestDeleteRoom(roomId).subscribe(() => {
      this.requestGetRooms().subscribe((rooms) => {
        this.userRooms.set(rooms);
      });
    });

    if (this.currentRoom()?.roomId === roomId) {
      this.currentRoom.set(null);
    }
  }

  public connect() {
    this.websocketService.connect(() => {
      if (!this.generalSubscription()) {
        this.initializeGeneralSubscription();
      }
    });
  }

  public sendMessage(destination: string, message: ChatMessageDTO) {
    this.websocketService.send(destination, message);
  }

  public initializeGeneralSubscription() {
    this.generalSubscription.set(
      this.websocketService.subscribe(`/topic/${this.authService.currentUserSig()!.id}/queue/messages`, (message) => {
        const body = JSON.parse(message.body);
        const msg: ChatMessage = {
          type: body.type,
          from: body.from,
          message: body.message,
          timestamp: new Date(body.timestamp),
          roomId: body.roomId,
        };
        console.log(msg);
        this.handleGeneralMessage(msg);
      })
    );
  }

  private handleGeneralMessage(msg: ChatMessage) {
    if (msg.type === "NEW_MESSAGE_IN_ROOM") {
      const room = this.userRooms().find((room) => room.roomId === msg.roomId);
      if (room) {
        const lastMessage: LastMessage = {
          author: msg.from,
          content: msg.message,
          timestamp: msg.timestamp.toString(),
        };
        room.lastMessage = lastMessage;
        this.userRooms.update((prev) =>
          prev
            .map((r) => (r.roomId === room.roomId ? { ...r, lastMessage } : r))
            .slice()
            .sort((a, b) => {
              if (!a.lastMessage && !b.lastMessage) return 0;
              if (!a.lastMessage) return 1;
              if (!b.lastMessage) return -1;
              return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
            })
        );
      }
    } else if (msg.type === "NEW_ROOM_INVITATION") {
      const room: RoomWithLastMessage = {
        roomId: msg.roomId,
        roomName: msg.message,
        lastMessage: undefined,
      };
      this.userRooms.update((prev) => [...prev, room]);
    }
  }

  public destroySubscription(subscription: Subscription) {
    this.websocketService.unsubscribe(subscription);
  }

  public changeRoom(newRoom: Room) {
    if (this.roomSubscription()) {
      this.websocketService.unsubscribe(this.roomSubscription()!);
    }
    this.currentRoom.set(newRoom);
    this.initializeRoomSubscription();
  }

  private initializeRoomSubscription() {
    this.resetServiceProperties();
    this.roomSubscription.set(
      this.websocketService.subscribe(`/topic/room/${this.currentRoom()!.roomId}`, (message) => {
        const body = JSON.parse(message.body);
        const msg: ChatMessage = {
          type: body.type,
          from: body.from,
          message: body.message,
          timestamp: new Date(body.timestamp),
          roomId: body.roomId,
        };
        this.handleNewMessage(msg);
      })
    );
    this.filterOldTypingMessages();
    this.getRoomParticipants(this.currentRoom()!.roomId);
  }

  private handleNewMessage(msg: ChatMessage) {
    if (msg.type === "TYPING") {
      this.handleTypingMessages(msg);
      return;
    }
    if (msg.type === "CALL_REQUEST") {
      this.handleCallRequestMessages(msg);
      return;
    }
    this.cleanTypingMessages(msg);
    this.messages.update((messages) => [...messages, msg]);
  }

  private handleCallRequestMessages(msg: ChatMessage) {
    let callRequestMessage: CallRequest = this.mapToCallRequest(msg);
    this.callRequestMessages.update((messages) => [...messages, callRequestMessage]);
  }

  private mapToCallRequest(msg: ChatMessage): CallRequest {
    return {
      from: msg.from,
      message: msg.message,
      expired: false,
    };
  }
  private handleTypingMessages(msg: ChatMessage) {
    const updatedMap: Map<string, ChatMessage> = new Map(this.typingMessages());
    updatedMap.set(msg.from, msg);
    this.typingMessages.set(updatedMap);
  }

  private cleanTypingMessages(msg: ChatMessage) {
    if (msg.type !== "CHAT" || !this.typingMessages().has(msg.from)) {
      return;
    }
    const updatedTypingMessages: Map<string, ChatMessage> = new Map(this.typingMessages());
    updatedTypingMessages.delete(msg.from);
    this.typingMessages.set(updatedTypingMessages);
  }

  private filterOldTypingMessages() {
    const source = interval(3000);
    const subscription = source.subscribe(() => {
      if (this.typingMessages().size !== 0) {
        const recentTypingMessages = new Map<string, ChatMessage>();
        const now = new Date();
        const threeSecondsAgo = new Date(now.getTime() - 3000);

        this.typingMessages().forEach((value, key) => {
          if (value.timestamp > threeSecondsAgo) {
            recentTypingMessages.set(key, value);
          }
        });
        this.typingMessages.set(recentTypingMessages);
      }
    });
  }

  private resetServiceProperties() {
    this.messages.set([]);
    this.typingMessages.set(new Map());
    this.oldMessages.set([]);
    this.callRequestMessages.set([]);
    this.connectionTimestamp.set(new Date().toISOString());
    this.oldMessagesPageNumber = 0;
    this.showLoadingMessagesPlaceholder.set(true);
  }
}
