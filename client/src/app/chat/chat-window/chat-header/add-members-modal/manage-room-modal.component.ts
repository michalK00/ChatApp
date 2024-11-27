import { Component, inject, model, output } from "@angular/core";
import { User } from "../../../../shared/model/user";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { UserService } from "../../../../shared/user.service";
import { RoomService } from "../../../shared/room.service";
import { debounceTime } from "rxjs";
import { KeyValuePipe, NgClass, NgFor, NgIf } from "@angular/common";

@Component({
  selector: "app-manage-room-modal",
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, NgIf, NgFor, KeyValuePipe],
  templateUrl: "./manage-room-modal.component.html",
  styles: ``,
})
export class ManageRoomModalComponent {
  private userService = inject(UserService);
  roomService = inject(RoomService);

  modalSearchInput = new FormControl("");
  newChatParticipants = new Map<string, User>();
  foundUsers: User[] = [];

  isManagingRoom = model.required<boolean>();
  managedRoom = output<boolean>();

  manageRoomForm = new FormGroup({
    roomName: new FormControl(this.roomService.currentRoom()!.roomName, { validators: Validators.required, updateOn: "blur" }),
  });

  ngOnInit() {
    this.modalSearchInput?.valueChanges.pipe(debounceTime(200)).subscribe(() => this.filterModalResults());
  }

  get roomName() {
    return this.manageRoomForm.get("roomName");
  }

  clearModalSearchInput() {
    this.modalSearchInput.reset();
    this.foundUsers = [];
  }

  toggleManagingRoom() {
    this.isManagingRoom.update((v) => !v);
    if (!this.isManagingRoom()) {
      this.manageRoomForm.reset();
    }
  }

  confirmManageRoom() {
    if (!this.manageRoomForm.valid) {
      return;
    }

    if (this.manageRoomForm.touched) {
      this.roomService.renameRoom(this.roomService.currentRoom()!.roomId, this.manageRoomForm.getRawValue().roomName!);
    }

    this.roomService.addParticipants(this.roomService.currentRoom()!.roomId, Array.from(this.newChatParticipants.values()));
    this.toggleManagingRoom();
    this.managedRoom.emit(true);
    this.manageRoomForm.reset();
  }

  filterModalResults() {
    let filterPhrase = this.modalSearchInput.value;
    if (!filterPhrase) {
      this.foundUsers = [];
      return;
    }
    this.userService
      .getUsersThatCanBeAddedToExistingRoom(this.roomService.currentRoom()!.roomId, filterPhrase)
      .subscribe((response) => {
        this.foundUsers = response;
      });
  }

  addParticipant(user: User) {
    if (this.newChatParticipants.has(user.email)) {
      return;
    }
    this.newChatParticipants.set(user.email, user);
    console.log(this.newChatParticipants);
  }

  removeChatParticipant(key: string) {
    this.newChatParticipants.delete(key);
  }
}
