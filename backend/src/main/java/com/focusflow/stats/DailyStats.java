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
}
