package pl.ztw.chat.chat.service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import pl.ztw.chat.chat.data.*;
import pl.ztw.chat.chat.dto.*;
import pl.ztw.chat.chat.enums.MessageType;
import pl.ztw.chat.chat.repository.MessageRepository;
import pl.ztw.chat.chat.repository.RoomRepository;
import pl.ztw.chat.chat.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@AllArgsConstructor
public class ChatServiceBean implements ChatService {
    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomRepository roomRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final List<MessageType> messageTypesToPersist = List.of(
            MessageType.CHAT, MessageType.CHANGE_NICKNAME, MessageType.CALL);

    @Override
    public MessageDTO sendPublicMessage(MessageDTO message, String username) {
        log.info("Public message: {} from user: {}", message, username);
        return new MessageDTO(
                message.type(),
                message.message(),
                LocalDateTime.now().toString(),
                message.from(),
                message.roomId()
        );
    }

    @Override
    public MessageDTO sendPrivateMessage(MessageDTO message) {
        var updatedMessage = new MessageDTO(
                message.type(),
                message.message(),
                LocalDateTime.now().toString(),
                message.from(),
                message.roomId()
        );
        log.info("Private message: {}", updatedMessage);
        messagingTemplate.convertAndSendToUser(message.roomId().toString(), "/queue/messages", updatedMessage);
        return updatedMessage;
    }

    @Override
    public void sendRoomMessage(String roomId, MessageDTO message) {
        var updatedMessage = new MessageDTO(
                message.type(),
                message.message(),
                LocalDateTime.now().toString(),
                message.from(),
                message.roomId()
        );
        log.info("Room message: {}", updatedMessage);

        var room = roomRepository.findById(Long.parseLong(roomId)).orElseThrow();
        Hibernate.initialize(room.getUsers());

        if (messageTypesToPersist.contains(message.type())) {
            messageRepository.save(pl.ztw.chat.chat.data.Message.builder()
                    .message(message.message())
                    .room(room)
                    .username(message.from())
                    .timestamp(LocalDateTime.parse(message.timestamp()))
                    .type(message.type())
                    .build());
            room.getUsers().forEach(user -> messagingTemplate.convertAndSend(
                    "/topic/" + user.getId() + "/queue/messages",
                    new MessageDTO(
                            MessageType.NEW_MESSAGE_IN_ROOM,
                            updatedMessage.message(),
                            LocalDateTime.now().toString(),
                            updatedMessage.from(),
                            updatedMessage.roomId()
                    )
            ));
        }
        messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
    }


    @Override
    public void userMessageUpdates(String username) {
        messagingTemplate.convertAndSendToUser(username, "/queue/messages", "New message");
    }

    @Override
    public MessageDTO newUser(MessageDTO message, SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("user", message.from());
        log.info("Message: {}  from user: {}", message, headerAccessor.getSessionAttributes().get("user"));
        return message;
    }

    @Override
    public List<RoomInfoDTO> getRooms() {
        var rooms = roomRepository.findAll()
                .stream()
                .map(RoomDTO::toRoom)
                .toList();

        return rooms.stream()
                .map(room -> RoomInfoDTO.builder()
                        .roomId(room.roomId())
                        .roomName(room.roomName())
                        .lastMessage(
                                LastMessageDTO.toLastMessageDTO(messageRepository.findLatestMessage(room.roomId()))
                        ).build())
                .collect(Collectors.toList());
    }

    @Override
    public Long newRoom(RoomNameDTO roomNameDTO, String username) {
        var user = userRepository.findByEmail(username).orElseThrow();
        var room = new Room(null, roomNameDTO.roomName(), new ArrayList<>());

        room.getUsers().add(user);
        user.getRooms().add(room);

        return roomRepository.save(room).getId();
    }

    @Override
    public List<RoomInfoDTO> getUsersRooms(String name) {
        User user = userRepository.findByEmail(name).orElseThrow();
        var rooms = user.getRooms()
                .stream()
                .map(RoomDTO::toRoom)
                .toList();

        return rooms.stream()
                .map(room -> RoomInfoDTO.builder()
                        .roomId(room.roomId())
                        .roomName(room.roomName())
                        .lastMessage(
                                LastMessageDTO.toLastMessageDTO(messageRepository.findLatestMessage(room.roomId()))
                        ).build())
                .collect(Collectors.toList());
    }

    @Override
    public void joinRoom(Long roomId, String name) {
        var user = userRepository.findByEmail(name).orElseThrow();
        var room = roomRepository.findById(roomId).orElseThrow();

        if (room.getUsers().contains(user)) {
            throw new IllegalArgumentException("User already in room");
        }
        room.getUsers().add(user);
        user.getRooms().add(room);
        roomRepository.save(room);
    }

    @Override
    public void leaveRoom(Long roomId, String name) {
        var user = userRepository.findByEmail(name).orElseThrow();
        var room = roomRepository.findById(roomId).orElseThrow();
        if (!room.getUsers().contains(user)) {
            throw new IllegalArgumentException("User not in room");
        }
        room.getUsers().remove(user);
        user.getRooms().remove(room);
        if (room.getUsers().isEmpty()) {
            roomRepository.delete(room);
        } else {
            roomRepository.save(room);
        }
    }

    @Override
    public void addToRoom(Long roomId, Long userId, String name) {
        var userToAdd = userRepository.findById(userId).orElseThrow();
        var user = userRepository.findByEmail(name).orElseThrow();
        var room = roomRepository.findById(roomId).orElseThrow();
        if (!room.getUsers().contains(user)) {
            throw new IllegalArgumentException("User not in room (only users from room can invite others)");
        }
        if (room.getUsers().contains(userToAdd)) {
            throw new IllegalArgumentException("User already in room");
        }
        room.getUsers().add(userToAdd);
        userToAdd.getRooms().add(room);
        messagingTemplate.convertAndSend("/topic/" + userToAdd.getId().toString() + "/queue/messages", MessageDTO.builder()
                .type(MessageType.NEW_ROOM_INVITATION)
                .roomId(roomId)
                .timestamp(LocalDateTime.now().toString())
                .message(room.getName())
                .from(null)
                .build()
        );
        roomRepository.save(room);
    }

    @Override
    public void addToRoom(Long roomId, List<Long> userIds, String name) {
        List<User> usersToAdd = userRepository.findAllById(userIds);
        var user = userRepository.findByEmail(name).orElseThrow();
        var room = roomRepository.findById(roomId).orElseThrow();
        if (!room.getUsers().contains(user)) {
            throw new IllegalArgumentException("User not in room (only users from room can invite others)");
        }

        usersToAdd.forEach(userToAdd -> {
            if (room.getUsers().contains(userToAdd)) {
                throw new IllegalArgumentException("User already in room");
            }
            room.getUsers().add(userToAdd);
            userToAdd.getRooms().add(room);
            messagingTemplate.convertAndSend("/topic/" + userToAdd.getId().toString() + "/queue/messages", MessageDTO.builder()
                    .type(MessageType.NEW_ROOM_INVITATION)
                    .roomId(roomId)
                    .timestamp(LocalDateTime.now().toString())
                    .message(room.getName())
                    .from(null)
                    .build()
            );
        });
        roomRepository.save(room);
    }

    @Override
    public List<UserDTO> getUsersDetailsThatCanBeAdded(Long roomId, String name, String userSearchName) {
        var currentUser = userRepository.findByEmail(name).orElseThrow();
        var room = roomRepository.findById(roomId).orElseThrow();

        return userRepository.findAll()
                .stream()
                .filter(user -> !room.getUsers().contains(user) && !user.equals(currentUser) &&
                        (userSearchName == null || user.getNickname().toLowerCase().contains(userSearchName.toLowerCase())))
                .map(UserDTO::toUserDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> getUsersDetailsThatCanBeAdded(String name, String userSearchName) {
        User user = userRepository.findByEmail(name).orElseThrow();

        return userRepository.findAll()
                .stream()
                .filter(u -> !u.equals(user) &&
                        (userSearchName == null || u.getNickname().toLowerCase().contains(userSearchName.toLowerCase())))
                .map(UserDTO::toUserDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void changeRoomName(Long roomId, String newName, String name) {
        var user = userRepository.findByEmail(name).orElseThrow();
        var room = roomRepository.findById(roomId).orElseThrow();

        if (!room.getUsers().contains(user)) {
            throw new IllegalArgumentException("Only room members can change the name");
        }
        room.setName(newName);
        roomRepository.save(room);
    }

    @Override
    public List<UserDTO> getRoomParticipants(Long roomId, String name) {
        var user = userRepository.findByEmail(name).orElseThrow();
        var room = roomRepository.findById(roomId).orElseThrow();

        if (!room.getUsers().contains(user)) {
            throw new IllegalArgumentException("Only room members can view participants");
        }
        return room.getUsers().stream().map(UserDTO::toUserDTO).toList();
    }

    @Override
    public List<MessageDTO> getOldMessages(Long roomId, LocalDateTime timestamp, Long pageSize, Long pageNumber, String name) {
        var user = userRepository.findByEmail(name).orElseThrow();
        var room = roomRepository.findById(roomId).orElseThrow();

        if (!room.getUsers().contains(user)) {
            throw new IllegalArgumentException("Only room members can view messages");
        }
        Pageable pageable = PageRequest.of(pageNumber.intValue(), pageSize.intValue());
        return messageRepository.findAllByRoomIdAndTimestampBeforeOrderByTimestampDesc(roomId, timestamp, pageable)
                .stream()
                .map(Message::toMessageDTO)
                .toList();
    }

}
