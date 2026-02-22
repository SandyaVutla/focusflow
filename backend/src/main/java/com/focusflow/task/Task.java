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
    private String status; // "ACTIVE", "COMPLETED"
    private String priority; // "High", "Medium", "Low"
    private LocalDate date;
    private LocalDate createdAt;

    public Task(String userId, String title, String priority, LocalDate date) {
        this.userId = userId;
        this.title = title;
        this.priority = priority;
        this.date = date != null ? date : LocalDate.now();
        this.status = "ACTIVE";
        this.createdAt = LocalDate.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }
}
