package com.focusflow.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;

public class DashboardSummary {
    private long tasksCompletedToday;
    private long totalTasksToday;
    private long pendingTasks;
    private int focusMinutesToday;
    private int waterIntakeToday;
    private int currentStreak;
    private int bestStreak;

    public DashboardSummary(long tasksCompletedToday, long totalTasksToday, long pendingTasks, int focusMinutesToday,
            int waterIntakeToday, int currentStreak, int bestStreak) {
        this.tasksCompletedToday = tasksCompletedToday;
        this.totalTasksToday = totalTasksToday;
        this.pendingTasks = pendingTasks;
        this.focusMinutesToday = focusMinutesToday;
        this.waterIntakeToday = waterIntakeToday;
        this.currentStreak = currentStreak;
        this.bestStreak = bestStreak;
    }

    public long getTasksCompletedToday() {
        return tasksCompletedToday;
    }

    public void setTasksCompletedToday(long tasksCompletedToday) {
        this.tasksCompletedToday = tasksCompletedToday;
    }

    public long getTotalTasksToday() {
        return totalTasksToday;
    }

    public void setTotalTasksToday(long totalTasksToday) {
        this.totalTasksToday = totalTasksToday;
    }

    public long getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(long pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public int getFocusMinutesToday() {
        return focusMinutesToday;
    }

    public void setFocusMinutesToday(int focusMinutesToday) {
        this.focusMinutesToday = focusMinutesToday;
    }

    public int getWaterIntakeToday() {
        return waterIntakeToday;
    }

    public void setWaterIntakeToday(int waterIntakeToday) {
        this.waterIntakeToday = waterIntakeToday;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public int getBestStreak() {
        return bestStreak;
    }

    public void setBestStreak(int bestStreak) {
        this.bestStreak = bestStreak;
    }
}
