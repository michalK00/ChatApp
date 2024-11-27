package pl.ztw.chat.chat.dto;

import lombok.Builder;
import pl.ztw.chat.chat.data.Message;

import java.time.LocalDateTime;

@Builder
public record LastMessageDTO(
        String author,
        String content,
        LocalDateTime timestamp) {

    public static LastMessageDTO toLastMessageDTO(Message latestMessage) {
        if (latestMessage == null) {
            return null;
        }
        return LastMessageDTO.builder()
                .author(latestMessage.getUsername())
                .content(latestMessage.getMessage())
                .timestamp(latestMessage.getTimestamp())
                .build();
    }
}
