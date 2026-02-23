package com.focusflow.dashboard;

import com.focusflow.task.Task;
import com.focusflow.task.TaskRepository;
import com.focusflow.focus.FocusService;
import com.focusflow.water.WaterService;
import com.focusflow.streak.StreakService;
import com.focusflow.streak.UserStreak;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private FocusService focusService;
    @Autowired
    private WaterService waterService;
    @Autowired
    private StreakService streakService;

    public DashboardSummary getSummary(String userId) {
        LocalDate today = LocalDate.now();

        // 1. Task metrics
        List<Task> todayTasks = taskRepository.findByUserIdAndDate(userId, today);
        long completedToday = todayTasks.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count();
        long totalToday = todayTasks.size();
        long pendingToday = todayTasks.stream().filter(t -> "ACTIVE".equals(t.getStatus())).count();

        // 2. Focus metrics
        int focusMins = focusService.getTodayTotalMinutes(userId);

        // 3. Water metrics
        int waterIntake = waterService.getTodayCount(userId);

        // 4. Daily Goal Check for Streak (Avoid redundant repository calls)
        boolean goalMet = completedToday >= 4 && focusMins >= 60 && waterIntake >= 5;

        // 5. Streak metrics (Passing pre-calculated goalMet)
        UserStreak streak = streakService.getAndUpdateStreak(userId, goalMet);

        return new DashboardSummary(
                completedToday,
                totalToday,
                pendingToday,
                focusMins,
                waterIntake,
                streak.getCurrentStreak(),
                streak.getBestStreak());
    }
}
