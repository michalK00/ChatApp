package pl.ztw.chat.chat.service;

import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import pl.ztw.chat.chat.dto.RoomInfoDTO;
import pl.ztw.chat.chat.dto.UserDTO;
import pl.ztw.chat.chat.dto.MessageDTO;
import pl.ztw.chat.chat.dto.RoomNameDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatService {

    MessageDTO sendPublicMessage(MessageDTO message, String username);

    MessageDTO sendPrivateMessage(MessageDTO message);

    MessageDTO newUser (MessageDTO message, SimpMessageHeaderAccessor headerAccessor);

    List<RoomInfoDTO> getRooms();

    Long newRoom(RoomNameDTO room, String username);

    List<RoomInfoDTO> getUsersRooms(String name);

    void joinRoom(Long roomId, String name);

    void leaveRoom(Long roomId, String name);

    void addToRoom(Long roomId, Long userId, String name);

    void addToRoom(Long roomId, List<Long> userIds, String name);

    List<UserDTO> getUsersDetailsThatCanBeAdded(Long roomId, String name, String userSearchName);

    List<UserDTO> getUsersDetailsThatCanBeAdded(String name, String userSearchName);

    void sendRoomMessage(String roomId, MessageDTO message);

    void changeRoomName(Long roomId, String newName, String name);

    List<UserDTO> getRoomParticipants(Long roomId, String name);

    List<MessageDTO> getOldMessages(Long roomId, LocalDateTime timestamp, Long pageSize, Long pageNumber, String name);

    void userMessageUpdates(String username);
}
