import { Component, OutputEmitterRef, computed, effect, inject, model, signal } from "@angular/core";
import { RoomService } from "../shared/room.service";
import { CommonModule } from "@angular/common";
import { FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from "@angular/forms";
import { ChatListElementComponent } from "./chat-list-element/chat-list-element.component";
import { SidebarMode } from "../chat.component";
import { NewRoomModalComponent } from "./new-room-modal/new-room-modal.component";
import { RtcService } from "../chat-window/shared/rtc.service";
import { delay } from "rxjs";

@Component({
  selector: "app-sidebar",
  standalone: true,
  templateUrl: `./sidebar.component.html`,
  styles: ``,
  imports: [ReactiveFormsModule, CommonModule, ChatListElementComponent, FormsModule, NewRoomModalComponent],
})
export class SidebarComponent {
  roomService = inject(RoomService);
  rtcService = inject(RtcService);

  sidebarMode = model.required<SidebarMode>();
  filteredRooms = computed(() => this.roomService.userRooms());
  isAddingNewRoom = signal<boolean>(false);
  searchInput = new FormControl("");

  ngOnInit() {
    this.fetchRooms();
  }

  isModeAccount() {
    return this.sidebarMode() === "MYACCOUNT";
  }

  isModeChat() {
    return this.sidebarMode() === "CHAT";
  }

  setModeAccount() {
    this.sidebarMode.set("MYACCOUNT");
  }

  setModeChat() {
    this.sidebarMode.set("CHAT");
  }

  fetchRooms() {
    this.roomService.getUserRooms().subscribe((rooms) => {
      if (rooms) {
        this.roomService.showLoadingRoomsAnimation.set(false);
      }
      this.roomService.userRooms.set(
        rooms.slice().sort((a, b) => {
          if (!a.lastMessage && !b.lastMessage) return 0;
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
        })
      );
    });
  }

  toggleAddingNewRoom() {
    this.isAddingNewRoom.update((v) => !v);
  }

  clearSearchInput() {
    this.searchInput.reset();
    this.filterResults();
  }

  filterResults() {
    let filterPhrase = this.searchInput.value;
    if (!filterPhrase) {
      this.filteredRooms = computed(() =>
        this.roomService
          .userRooms()
          .slice()
          .sort((a, b) => {
            if (!a.lastMessage && !b.lastMessage) return 0;
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
          })
      );
      return;
    }
    this.filteredRooms = computed(() =>
      this.roomService
        .userRooms()
        .filter((room) => room.roomName.toLowerCase().includes(filterPhrase!.toLowerCase()))
        .slice()
        .sort((a, b) => {
          if (!a.lastMessage && !b.lastMessage) return 0;
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
        })
    );
  }
}
