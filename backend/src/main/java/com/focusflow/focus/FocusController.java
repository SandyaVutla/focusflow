package com.focusflow.focus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/focus")
public class FocusController {
    @Autowired
    private FocusService focusService;

    @PostMapping("/start")
    public ResponseEntity<FocusSession> start(@RequestBody FocusStartRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(focusService.startSession(userId, request.getTaskId()));
    }

    @PostMapping("/stop")
    public ResponseEntity<FocusSession> stop() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        FocusSession session = focusService.stopSession(userId);
        if (session == null)
            return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(session);
    }

    @GetMapping("/today")
    public ResponseEntity<Integer> getToday() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(focusService.getTodayTotalMinutes(userId));
    }
}
