package com.focusflow.water;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/water")
public class WaterController {
    @Autowired
    private WaterService waterService;

    @PostMapping("/add")
    public ResponseEntity<Integer> addWater(@RequestBody WaterAddRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        int totalToday = waterService.addWater(userId, request.getAmount());
        return ResponseEntity.ok(totalToday);
    }

    @GetMapping("/today")
    public ResponseEntity<Integer> getToday() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(waterService.getTodayCount(userId));
    }
}
