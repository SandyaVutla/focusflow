package com.focusflow.task;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@Document(collection = "tasks")
public class Task {
    @Id
    private String id;
    private String userId;
    private String title;
    private String category;
    private String time;
    private String status; // "ACTIVE", "COMPLETED"
    private String priority; // "high", "medium", "low"
    private LocalDate date;
    private LocalDate createdAt;

    public Task(String userId, String title, String category, String time, String priority, LocalDate date) {
        this.userId = userId;
        this.title = title;
        this.category = category;
        this.time = time;
        this.priority = priority;
        this.date = date != null ? date : LocalDate.now();
        this.status = "ACTIVE";
        this.createdAt = LocalDate.now();
    }
}
