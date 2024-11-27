import { NgClass, NgFor, NgIf } from "@angular/common";
import { Component, inject, model, output } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { UserService } from "../../../shared/user.service";
import { User } from "../../../shared/model/user";
import { RoomService } from "../../shared/room.service";
import { debounceTime } from "rxjs";
import { KeyValuePipe } from "@angular/common";

@Component({
  selector: "app-new-room-modal",
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, NgIf, NgFor, KeyValuePipe],
  templateUrl: `./new-room-modal.component.html`,
  styles: ``,
})
export class NewRoomModalComponent {
  modalSearchInput = new FormControl("");
  newChatParticipants = new Map<string, User>();
  private userService = inject(UserService);
  private roomService = inject(RoomService);
  foundUsers: User[] = [];
  isAddingNewRoom = model.required<boolean>();
  addedNewRoom = output<boolean>();
  showNoParticipantsMessage = false;

  newRoomForm = new FormGroup({
    roomName: new FormControl("", { validators: Validators.required, updateOn: "blur" }),
  });

  ngOnInit() {
    this.modalSearchInput?.valueChanges.pipe(debounceTime(200)).subscribe(() => this.filterModalResults());
  }

  get roomName() {
    return this.newRoomForm.get("roomName");
  }

  clearModalSearchInput() {
    this.modalSearchInput.reset();
    this.foundUsers = [];
  }

  toggleAddingNewRoom() {
    this.isAddingNewRoom.update((v) => !v);
    if (!this.isAddingNewRoom()) {
      this.newRoomForm.reset();
    }
  }

  confirmAddNewRoom() {
    if (!this.newRoomForm.valid) {
      return;
    }
    if (this.newChatParticipants.size === 0) {
      this.showNoParticipantsMessage = true;
      return;
    }
    this.roomService.addNewRoom(this.roomName!.value!).subscribe((response) => {
      this.roomService.addParticipants(response, Array.from(this.newChatParticipants.values()));
      this.toggleAddingNewRoom();
      this.addedNewRoom.emit(true);
      this.newRoomForm.reset();
    });
  }

  filterModalResults() {
    let filterPhrase = this.modalSearchInput.value;
    if (!filterPhrase) {
      this.foundUsers = [];
      return;
    }
    this.userService.getUsersThatCanBeAddedToNewRoom(filterPhrase).subscribe((response) => {
      this.foundUsers = response;
    });
  }

  addParticipant(user: User) {
    if (this.newChatParticipants.has(user.email)) {
      return;
    }
    this.newChatParticipants.set(user.email, user);
    this.showNoParticipantsMessage = false;
  }

  removeChatParticipant(key: string) {
    this.newChatParticipants.delete(key);
  }
}
