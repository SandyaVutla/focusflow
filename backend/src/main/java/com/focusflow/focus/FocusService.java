package com.focusflow.focus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;

@Service
public class FocusService {
    @Autowired
    private FocusSessionRepository repository;

    public FocusSession startSession(String userId, String taskId) {
        // Optional: stop any existing active session
        repository.findByUserIdAndActive(userId, true).ifPresent(s -> stopSession(userId));

        FocusSession session = new FocusSession(userId, taskId);
        return repository.save(session);
    }

    public FocusSession stopSession(String userId) {
        return repository.findByUserIdAndActive(userId, true).map(session -> {
            session.setEndTime(LocalDateTime.now());
            long mins = Duration.between(session.getStartTime(), session.getEndTime()).toMinutes();
            session.setDurationMinutes((int) mins);
            session.setActive(false);
            return repository.save(session);
        }).orElse(null);
    }

    public int getTodayTotalMinutes(String userId) {
        List<FocusSession> sessions = repository.findByUserIdAndDate(userId, LocalDate.now());
        return sessions.stream().mapToInt(FocusSession::getDurationMinutes).sum();
    }
}
