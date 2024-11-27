package pl.ztw.chat.chat.dto;

import lombok.Builder;

@Builder
public record RoomInfoDTO(
        Long roomId,
        String roomName,
        LastMessageDTO lastMessage)
{}

