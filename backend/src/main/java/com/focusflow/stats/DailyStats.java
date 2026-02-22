package com.focusflow.stats;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@NoArgsConstructor
@Document(collection = "daily_stats")
public class DailyStats {
    @Id
    private String id;
    private String userId;
    private String date; // YYYY-MM-DD
    private int tasksCompleted;
    private int tasksTotal;
    private int focusMinutes;
    private int waterGlasses;
    private boolean goalsMet;
    private Date createdAt;

    public DailyStats(String userId, String date) {
        this.userId = userId;
        this.date = date;
        this.tasksCompleted = 0;
        this.tasksTotal = 0;
        this.focusMinutes = 0;
        this.waterGlasses = 0;
        this.goalsMet = false;
        this.createdAt = new Date();
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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public int getTasksCompleted() {
        return tasksCompleted;
    }

    public void setTasksCompleted(int tasksCompleted) {
        this.tasksCompleted = tasksCompleted;
    }

    public int getTasksTotal() {
        return tasksTotal;
    }

    public void setTasksTotal(int tasksTotal) {
        this.tasksTotal = tasksTotal;
    }

    public int getFocusMinutes() {
        return focusMinutes;
    }

    public void setFocusMinutes(int focusMinutes) {
        this.focusMinutes = focusMinutes;
    }

    public int getWaterGlasses() {
        return waterGlasses;
    }

    public void setWaterGlasses(int waterGlasses) {
        this.waterGlasses = waterGlasses;
    }

    public boolean isGoalsMet() {
        return goalsMet;
    }

    public void setGoalsMet(boolean goalsMet) {
        this.goalsMet = goalsMet;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
