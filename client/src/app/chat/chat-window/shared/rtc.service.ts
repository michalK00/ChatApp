import { ElementRef, Injectable, inject, signal } from "@angular/core";
import { MediaConnection, Peer, PeerJSOption } from "peerjs";
import { BehaviorSubject } from "rxjs";
import { RoomService } from "../../shared/room.service";
import { ChatMessage, ChatMessageDTO } from "../message-list/messages/message";
import { AuthService } from "../../../auth/shared/auth.service";
import { v4 as uuidv4 } from "uuid";
import { environment } from "../../../../environments/environment";

export type CallStatus = "Inactive" | "Calling" | "Active";

export interface RtcConnection {
  isInitializer: boolean;
  callStatus: CallStatus;
  initializerId: string;
}

const mediaConstraints = {
  audio: true,
  video: true,
};

@Injectable({ providedIn: "root" })
export class RtcService {
  public peer?: Peer;
  public rtcConnection = signal<RtcConnection>({ isInitializer: true, callStatus: "Inactive", initializerId: "" });
  private mediaCall?: MediaConnection;

  private roomService = inject(RoomService);
  private authService = inject(AuthService);

  private localStreamBs: BehaviorSubject<MediaStream> = new BehaviorSubject(new MediaStream());
  public localStream$ = this.localStreamBs?.asObservable();
  private remoteStreamBs: BehaviorSubject<MediaStream> = new BehaviorSubject(new MediaStream());
  public remoteStream$ = this.remoteStreamBs?.asObservable();

  initializePeer() {
    if (!this.peer || this.peer.disconnected) {
      const peerJsOptions: PeerJSOption = {
        debug: 1,
        config: {
          iceServers: environment.envVar.ICE_SERVERS,
        },
      };
      const id = uuidv4();
      this.peer = new Peer(id, peerJsOptions);
      console.log(this.peer!.id);

      this.rtcConnection.update((prev) => {
        return {
          isInitializer: prev.isInitializer,
          callStatus: prev.callStatus,
          initializerId: prev.isInitializer ? id : prev.initializerId,
        };
      });
    }
  }

  public sendCallRequestMessage() {
    this.roomService.sendMessage(
      `/app/sendRoomMessage/${this.roomService.currentRoom()!.roomId}`,
      this.createCallRequestMessage()
    );
  }

  async call(remotePeerId: string) {
    try {
      console.log("Starting call with remote peer:", remotePeerId);

      // Get the local media stream
      const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      console.log("Local media stream obtained:", mediaStream);

      // Update the local stream observable
      this.localStreamBs.next(mediaStream);
      console.log("Local stream broadcasted.");

      // Establish a connection to the remote peer
      const connection = this.peer!.connect(remotePeerId);
      console.log("Connection established with remote peer:", connection);

      // Handle connection errors
      connection.on("error", (err) => {
        console.error("Connection error:", err);
      });

      // Initiate a media call to the remote peer
      this.mediaCall = this.peer!.call(remotePeerId, mediaStream);
      console.log("Media call initiated with remote peer:", this.mediaCall);

      // Handle remote stream
      this.mediaCall.on("stream", (remoteStream) => {
        console.log("Remote stream received:", remoteStream);
        this.remoteStreamBs!.next(remoteStream);
      });

      // Handle call closure
      this.mediaCall.on("close", () => {
        console.log("Call closed.");
        this.closeMediaCall();
        this.onCallClose();
      });
    } catch (error) {
      console.error("Error in call method:", error);
    }
  }

  async answer() {
    try {
      console.log("Answering call.");
      // Get the local media stream
      const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      console.log("Local media stream obtained:", mediaStream);

      // Update the local stream observable
      this.localStreamBs.next(mediaStream);
      console.log("Local stream broadcasted.");

      // Handle incoming call
      this.peer!.on("call", (call) => {
        console.log("Incoming call:", call);

        // Answer the call with the local media stream
        call.answer(mediaStream);

        console.log("Call answered with local media stream.");

        // Handle remote stream
        call.on("stream", (remoteStream) => {
          console.log("Remote stream received:", remoteStream);
          this.remoteStreamBs!.next(remoteStream);
        });

        // Handle call closure
        call.on("close", () => {
          this.roomService.sendMessage(
            `/app/sendRoomMessage/${this.roomService.currentRoom()!.roomId}`,
            this.createCallMessage()
          );
          console.log("Call closed.");
          this.closeMediaCall();
          this.onCallClose();
        });
      });
    } catch (error) {
      console.error("Error in answer method:", error);
    }
  }

  // async call(remotePeerId: string) {
  //   const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
  //   this.localStreamBs.next(mediaStream);
  //   const connection = this.peer!.connect(remotePeerId);
  //   connection.on("error", (err) => {
  //     console.error(err);
  //   });
  //   this.mediaCall = this.peer!.call(remotePeerId, mediaStream);

  //   this.mediaCall.on("stream", (remoteStream) => {
  //     this.remoteStreamBs!.next(remoteStream);
  //   });
  //   this.mediaCall.on("close", () => this.onCallClose());
  // }

  // async answer() {
  //   const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
  //   this.localStreamBs.next(mediaStream);
  //   this.peer!.on("call", (call) => {
  //     call.answer(mediaStream);
  //     call.on("stream", (remoteStream) => {
  //       this.remoteStreamBs!.next(remoteStream);
  //     });
  //     call.on("close", () => this.onCallClose());
  //   });
  // }

  public onCallClose() {
    this.remoteStreamBs?.value.getTracks().forEach((track) => {
      track.stop();
    });
    this.localStreamBs?.value.getTracks().forEach((track) => {
      track.stop();
    });
  }

  public closeMediaCall() {
    this.mediaCall?.close();
    if (!this.mediaCall) {
      this.onCallClose();
    }
  }

  public destroyPeer() {
    console.log("Peer destroyed");

    this.mediaCall?.close();
    this.peer?.disconnect();
    this.peer?.destroy();
    this.rtcConnection.set({ isInitializer: true, callStatus: "Inactive", initializerId: "" });
  }

  private createCallRequestMessage(): ChatMessageDTO {
    return {
      type: "CALL_REQUEST",
      from: this.authService.currentUserSig()!.nickname,
      message: this.peer!.id,
      timestamp: new Date().toISOString(),
      roomId: this.roomService.currentRoom()!.roomId.toString(),
    };
  }

  private createCallMessage(): ChatMessageDTO {
    return {
      type: "CALL",
      from: this.authService.currentUserSig()!.nickname,
      message: "",
      timestamp: new Date().toISOString(),
      roomId: this.roomService.currentRoom()!.roomId.toString(),
    };
  }

  public toggleLocalVideo(isLocalVideoOn: boolean) {
    this.localStreamBs?.value.getVideoTracks().forEach((track) => {
      track.enabled = isLocalVideoOn;
    });
  }

  public toggleLocalAudio(isLocalAudioOn: boolean) {
    console.log("localAudioOn", isLocalAudioOn);

    this.localStreamBs?.value.getAudioTracks().forEach((track) => {
      track.enabled = isLocalAudioOn;
    });
  }
}
