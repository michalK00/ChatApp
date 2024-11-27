import { Injectable, inject, signal } from "@angular/core";
import { ChatMessageDTO } from "../chat/chat-window/message-list/messages/message";
import { RxStomp, RxStompConfig } from "@stomp/rx-stomp";
import { AuthService } from "../auth/shared/auth.service";
import { Subscription } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private rxStomp = new RxStomp();
  private authService = inject(AuthService);

  private rxStompConfig: RxStompConfig = {
    brokerURL: environment.envVar.BROKER_URL,

    heartbeatIncoming: 0,
    heartbeatOutgoing: 20000,

    reconnectDelay: 1000,

    // It can be quite verbose, not recommended in production
    // debug: (msg: string): void => {
    //   console.log(new Date(), msg);
    // },
  };

  public isConnected = signal<Boolean>(false);

  public connect(onConnect?: () => void) {
    this.rxStompConfig.connectHeaders = {
      Authorization: `Bearer ${this.authService.currentUserSig()?.token}`,
    };
    this.rxStomp.configure(this.rxStompConfig);

    this.rxStomp.activate();
    this.rxStomp.connected$.subscribe(() => {
      this.isConnected.set(this.rxStomp.connected());
      if (onConnect) {
        onConnect();
      }
    });
  }

  public send(destination: string, message: ChatMessageDTO) {
    if (this.isConnected()) {
      this.rxStomp.publish({ destination: destination, body: JSON.stringify(message) });
    }
  }

  public subscribe(topic: string, callback: (message: any) => void) {
    if (this.isConnected()) {
      return this.rxStomp.watch({ destination: topic }).subscribe(callback);
    }
    return undefined;
  }

  public unsubscribe(subscribtion: Subscription) {
    if (this.isConnected()) {
      subscribtion.unsubscribe();
    }
  }
}
