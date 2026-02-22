package com.focusflow.stats;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class DailyStatsService {
    @Autowired
    private DailyStatsRepository dailyStatsRepository;

    public DailyStats updateTodayStats(String userId, Integer tasksCompleted, Integer tasksTotal, Integer focusMinutes,
            Integer waterGlasses) {
        String today = LocalDate.now().toString();
        DailyStats stats = dailyStatsRepository.findByUserIdAndDate(userId, today)
                .orElse(new DailyStats(userId, today));

        if (tasksCompleted != null)
            stats.setTasksCompleted(tasksCompleted);
        if (tasksTotal != null)
            stats.setTasksTotal(tasksTotal);
        if (focusMinutes != null)
            stats.setFocusMinutes(focusMinutes);
        if (waterGlasses != null)
            stats.setWaterGlasses(waterGlasses);

        // Check if goals are met: 4 tasks, 60 mins focus, 5 glasses water
        boolean met = stats.getTasksCompleted() >= 4 &&
                stats.getFocusMinutes() >= 60 &&
                stats.getWaterGlasses() >= 5;

        stats.setGoalsMet(met);

        return dailyStatsRepository.save(stats);
    }

    public List<DailyStats> getWeeklyStats(String userId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);
        return dailyStatsRepository.findByUserIdAndDateBetween(userId, startDate.toString(), endDate.toString());
    }

    public List<DailyStats> getMonthlyStats(String userId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(29);
        return dailyStatsRepository.findByUserIdAndDateBetween(userId, startDate.toString(), endDate.toString());
    }

    public int calculateCurrentStreak(String userId) {
        List<DailyStats> allStats = dailyStatsRepository.findByUserId(userId);
        if (allStats.isEmpty())
            return 0;

        int streak = 0;
        LocalDate date = LocalDate.now();

        // 1. Check today
        final String todayStr = date.toString();
        Optional<DailyStats> todayStats = allStats.stream().filter(s -> s.getDate().equals(todayStr)).findFirst();

        if (todayStats.isPresent() && todayStats.get().isGoalsMet()) {
            streak++;
        }

        // 2. Check preceding days
        date = date.minusDays(1);
        while (true) {
            final String checkDate = date.toString();
            Optional<DailyStats> stats = allStats.stream().filter(s -> s.getDate().equals(checkDate)).findFirst();
            if (stats.isPresent() && stats.get().isGoalsMet()) {
                streak++;
                date = date.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }
}
