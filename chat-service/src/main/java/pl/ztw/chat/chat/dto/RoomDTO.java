package pl.ztw.chat.chat.dto;

import lombok.Builder;
import pl.ztw.chat.chat.data.Room;

@Builder
public record RoomDTO(
        Long roomId,
        String roomName
) {
    public static RoomDTO toRoom(Room room) {
        return new RoomDTO(
                room.getId(),
                room.getName()
        );
    }
}
