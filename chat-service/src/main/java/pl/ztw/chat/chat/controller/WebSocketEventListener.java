package pl.ztw.chat.chat.controller;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import pl.ztw.chat.chat.enums.UserStatus;
import pl.ztw.chat.chat.dto.MessageDTO;
import pl.ztw.chat.chat.enums.MessageType;
import pl.ztw.chat.chat.repository.UserRepository;

import java.time.LocalDateTime;

@Slf4j
@Component
@AllArgsConstructor
public class WebSocketEventListener {

    private final SimpMessageSendingOperations sendingOperations;
    private final UserRepository userRepository;

    @EventListener
    public void handleWebSocketConnectionListener(SessionConnectedEvent event) {
        log.info("New user connected to the chat");
        updateUserStatus(event, UserStatus.ACTIVE);
    }

    @EventListener
    public void handleWebSocketDisconnectionListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String user = (String) headerAccessor.getSessionAttributes().get("user");

        if (user != null) {
            MessageDTO message = MessageDTO.builder()
                    .type(MessageType.DISCONNECT)
                    .from(user)
                    .timestamp(LocalDateTime.now().toString())
                    .build();
            log.info("User disconnected: {}", message);
            sendingOperations.convertAndSend("/topic/public", message);
            updateUserStatus(event, UserStatus.INACTIVE);
        }
    }

    private void updateUserStatus(Object event, UserStatus status) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(((SessionConnectedEvent) event).getMessage());
        String email = headerAccessor.getUser().getName();
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setStatus(status);
            userRepository.save(user);
        });
    }
}
