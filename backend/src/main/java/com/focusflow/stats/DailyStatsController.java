package com.focusflow.stats;

import com.focusflow.model.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class DailyStatsController {
    @Autowired
    private DailyStatsService dailyStatsService;

    @PostMapping("/today")
    public ResponseEntity<?> updateTodayStats(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Integer> updates) {
        DailyStats stats = dailyStatsService.updateTodayStats(
                userDetails.getId(),
                updates.get("tasksCompleted"),
                updates.get("tasksTotal"),
                updates.get("focusMinutes"),
                updates.get("waterGlasses"));
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/weekly")
    public ResponseEntity<?> getWeeklyStats(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(dailyStatsService.getWeeklyStats(userDetails.getId()));
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyStats(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(dailyStatsService.getMonthlyStats(userDetails.getId()));
    }

    @GetMapping("/streak")
    public ResponseEntity<?> getStreak(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        int streak = dailyStatsService.calculateCurrentStreak(userDetails.getId());
        return ResponseEntity.ok(Map.of("streak", streak));
    }
}
