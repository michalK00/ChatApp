package pl.ztw.chat.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.ztw.chat.chat.data.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {

}
