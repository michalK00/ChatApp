import { Injectable, inject } from "@angular/core";
import { User } from "./model/user";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: "root" })
export class UserService {
  private http = inject(HttpClient);

  private requestGetUsersThatCanBeAddedToNewRoom(filterPhrase: string) {
    return this.http.get<User[]>(
      `${environment.envVar.API_BASE_URL}/users-details-that-can-be-added?userSearchName=${filterPhrase}`
    );
  }
  private requestGetUsersThatCanBeAddedToExistingRoom(roomId: number, filterPhrase: string) {
    return this.http.get<User[]>(
      `${environment.envVar.API_BASE_URL}/users-details-that-can-be-added/${roomId}?userSearchName=${filterPhrase}`
    );
  }

  getUsersThatCanBeAddedToNewRoom(filterPhrase: string) {
    return this.requestGetUsersThatCanBeAddedToNewRoom(filterPhrase);
  }

  getUsersThatCanBeAddedToExistingRoom(roomId: number, filterPhrase: string) {
    return this.requestGetUsersThatCanBeAddedToExistingRoom(roomId, filterPhrase);
  }
}
