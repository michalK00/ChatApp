package pl.ztw.chat.chat.controller;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;
import pl.ztw.chat.chat.dto.RoomInfoDTO;
import pl.ztw.chat.chat.dto.UserDTO;
import pl.ztw.chat.chat.dto.MessageDTO;
import pl.ztw.chat.chat.dto.RoomNameDTO;
import pl.ztw.chat.chat.service.ChatService;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@AllArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomInfoDTO>> dashboard() {
        return ResponseEntity.ok(chatService.getRooms());
    }

    @PostMapping("/new-room")
    public ResponseEntity<?> newRoom(@RequestBody RoomNameDTO room, Principal principal) {
        return ResponseEntity.ok().body(chatService.newRoom(room, principal.getName()));
    }

    @GetMapping("/user-rooms")
    public ResponseEntity<List<RoomInfoDTO>> getUsersRooms(Principal principal) {
        return ResponseEntity.ok(chatService.getUsersRooms(principal.getName()));
    }

    @PostMapping("/join-room/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable Long roomId, Principal principal) {
        chatService.joinRoom(roomId, principal.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/leave-room/{roomId}")
    public ResponseEntity<?> leaveRoom(@PathVariable Long roomId, Principal principal) {
        chatService.leaveRoom(roomId, principal.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/add-to-room/{roomId}/{userId}")
    public ResponseEntity<?> addUserToRoom(@PathVariable Long roomId, @PathVariable Long userId, Principal principal) {
        chatService.addToRoom(roomId, userId, principal.getName());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/change-room-name/{roomId}")
    public ResponseEntity<?> changeRoomName(@PathVariable Long roomId, @RequestBody RoomNameDTO newName, Principal principal) {
        chatService.changeRoomName(roomId, newName.roomName(), principal.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/room-participants/{roomId}")
    public ResponseEntity<List<UserDTO>> getRoomParticipants(@PathVariable Long roomId, Principal principal) {
        return ResponseEntity.ok(chatService.getRoomParticipants(roomId, principal.getName()));
    }

    @PostMapping("/add-to-room/{roomId}")
    public ResponseEntity<?> addUsersToRoom(@PathVariable Long roomId, @RequestBody List<Long> userIds, Principal principal) {
        chatService.addToRoom(roomId, userIds, principal.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users-details-that-can-be-added/{roomId}")
    public ResponseEntity<List<UserDTO>> getUsersDetailsThatCanBeAdded(@PathVariable Long roomId, Principal principal,
                                                                       @RequestParam(required = false) String userSearchName) {
        return ResponseEntity.ok(chatService.getUsersDetailsThatCanBeAdded(roomId, principal.getName(), userSearchName));
    }

    @GetMapping("/users-details-that-can-be-added")
    public ResponseEntity<List<UserDTO>> getUsersDetailsThatCanBeAdded(Principal principal,
                                                                       @RequestParam(required = false) String userSearchName) {
        return ResponseEntity.ok(chatService.getUsersDetailsThatCanBeAdded(principal.getName(), userSearchName));
    }

    @MessageMapping("/sendMessage")
    @SendTo("/topic/public")
    public MessageDTO sendPublicMessage(@Payload MessageDTO message, Principal principal) {
        return chatService.sendPublicMessage(message, principal.getName());
    }

    @MessageMapping("/sendPrivateMessage")
    public void sendPrivateMessage(@Payload MessageDTO message) {
        chatService.sendPrivateMessage(message);
    }

    @MessageMapping("/sendRoomMessage/{roomId}")
    public void sendRoomMessage(@DestinationVariable String roomId, @Payload MessageDTO message) {
        chatService.sendRoomMessage(roomId, message);
    }

    @MessageMapping("/user/{username}")
    public void userMessageUpdates(@DestinationVariable String username) {
        chatService.userMessageUpdates(username);
    }

    @MessageMapping("/newUser")
    public MessageDTO newUser(@Payload MessageDTO message, SimpMessageHeaderAccessor headerAccessor) {
        return chatService.newUser(message, headerAccessor);
    }

    @GetMapping("/get-old-messages/{roomId}")
    public ResponseEntity<List<MessageDTO>> getOldMessages(@PathVariable Long roomId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime timestamp,
                                                        @RequestParam(required = false, defaultValue = "20") Long pageSize,
                                                        @RequestParam(required = false, defaultValue = "0") Long pageNumber, Principal principal) {
        return ResponseEntity.ok(chatService.getOldMessages(roomId, timestamp, pageSize, pageNumber, principal.getName()));
    }

    @GetMapping("/secureTest")
    public ResponseEntity<String> secureTest() {
        return ResponseEntity.ok("Secure test");
    }
}
