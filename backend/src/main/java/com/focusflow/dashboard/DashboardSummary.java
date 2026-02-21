package com.focusflow.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardSummary {
    private long tasksCompletedToday;
    private long totalTasksToday;
    private long pendingTasks;
    private int focusMinutesToday;
    private int waterIntakeToday;
    private int currentStreak;
    private int bestStreak;
}
