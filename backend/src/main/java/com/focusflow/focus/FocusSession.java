package com.focusflow.focus;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "focus_sessions")
public class FocusSession {
    @Id
    private String id;
    private String userId;
    private String taskId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int durationMinutes;
    private LocalDate date;
    private boolean active;

    public FocusSession(String userId, String taskId) {
        this.userId = userId;
        this.taskId = taskId;
        this.startTime = LocalDateTime.now();
        this.date = LocalDate.now();
        this.active = true;
    }
}
