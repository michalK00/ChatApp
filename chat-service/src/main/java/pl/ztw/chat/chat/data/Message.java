package pl.ztw.chat.chat.data;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.jackson.Jacksonized;
import pl.ztw.chat.chat.dto.MessageDTO;
import pl.ztw.chat.chat.enums.MessageType;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Jacksonized
@Entity
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String message;
    private LocalDateTime timestamp;
    private String username;
    @Enumerated(EnumType.STRING)
    private MessageType type;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    public static MessageDTO toMessageDTO(Message o) {
        return MessageDTO.builder()
                .message(o.getMessage())
                .timestamp(o.getTimestamp().toString())
                .from(o.getUsername())
                .roomId(o.getRoom().getId())
                .type(o.getType())
                .build();
    }
}
