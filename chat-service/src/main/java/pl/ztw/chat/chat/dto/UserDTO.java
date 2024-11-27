package pl.ztw.chat.chat.dto;

import lombok.Builder;
import pl.ztw.chat.chat.data.User;
import pl.ztw.chat.chat.enums.UserStatus;

@Builder
public record UserDTO(
        Long id,
        String nickname,
        String email,
        UserStatus status) {

    public static UserDTO toUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .status(user.getStatus())
                .build();
    }
}
