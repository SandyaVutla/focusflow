package com.focusflow.focus;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

public interface FocusSessionRepository extends MongoRepository<FocusSession, String> {
    List<FocusSession> findByUserIdAndDate(String userId, LocalDate date);

    Optional<FocusSession> findByUserIdAndActive(String userId, boolean active);
}
