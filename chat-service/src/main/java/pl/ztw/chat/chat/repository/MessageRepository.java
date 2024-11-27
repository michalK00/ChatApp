package pl.ztw.chat.chat.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pl.ztw.chat.chat.data.Message;


import java.time.LocalDateTime;
import java.util.Arrays;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE m.room.id = ?1 ORDER BY m.timestamp DESC LIMIT 1")
    Message findLatestMessage(Long roomId);

    Page<Message> findAllByRoomIdAndTimestampBeforeOrderByTimestampDesc(Long roomId, LocalDateTime timestamp, Pageable pageable);
}
