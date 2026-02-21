package com.focusflow.streak;

import com.focusflow.task.Task;
import com.focusflow.task.TaskRepository;
import com.focusflow.focus.FocusSession;
import com.focusflow.focus.FocusSessionRepository;
import com.focusflow.water.WaterIntake;
import com.focusflow.water.WaterIntakeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class StreakService {
    @Autowired
    private StreakRepository streakRepository;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private FocusSessionRepository focusRepository;
    @Autowired
    private WaterIntakeRepository waterRepository;

    public UserStreak getAndUpdateStreak(String userId) {
        UserStreak streak = streakRepository.findByUserId(userId)
                .orElse(new UserStreak(userId));

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        // 1. Reset check: If last success was before yesterday, streak is broken
        if (streak.getLastSuccessfulDate().isBefore(yesterday)) {
            streak.setCurrentStreak(0);
        }

        // 2. Daily Goal Check
        if (streak.getLastSuccessfulDate().isBefore(today)) {
            if (isDailyGoalMet(userId, today)) {
                streak.setCurrentStreak(streak.getCurrentStreak() + 1);
                streak.setLastSuccessfulDate(today);
                if (streak.getCurrentStreak() > streak.getBestStreak()) {
                    streak.setBestStreak(streak.getCurrentStreak());
                }
            }
        }

        return streakRepository.save(streak);
    }

    private boolean isDailyGoalMet(String userId, LocalDate date) {
        // Goal: >= 4 tasks completed
        List<Task> tasks = taskRepository.findByUserIdAndDate(userId, date);
        long completedTasks = tasks.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count();
        if (completedTasks < 4)
            return false;

        // Goal: >= 60 minutes focus
        List<FocusSession> sessions = focusRepository.findByUserIdAndDate(userId, date);
        int totalFocusMins = sessions.stream().mapToInt(FocusSession::getDurationMinutes).sum();
        if (totalFocusMins < 60)
            return false;

        // Goal: >= 5 water glasses
        List<WaterIntake> intakes = waterRepository.findByUserIdAndDate(userId, date);
        int totalWater = intakes.stream().mapToInt(WaterIntake::getAmount).sum();
        if (totalWater < 5)
            return false;

        return true;
    }
}
