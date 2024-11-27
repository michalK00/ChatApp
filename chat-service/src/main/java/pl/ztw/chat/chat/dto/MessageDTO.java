package pl.ztw.chat.chat.dto;

import lombok.Builder;
import pl.ztw.chat.chat.enums.MessageType;

@Builder
public record MessageDTO(
        MessageType type,
        String message,
        String timestamp,
        String from,
        Long roomId
) {
}