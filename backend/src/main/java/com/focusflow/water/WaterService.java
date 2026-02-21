package com.focusflow.water;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class WaterService {
    @Autowired
    private WaterIntakeRepository repository;

    public int addWater(String userId, int amount) {
        WaterIntake intake = new WaterIntake(userId, amount, LocalDate.now());
        repository.save(intake);
        return getTodayCount(userId);
    }

    public int getTodayCount(String userId) {
        List<WaterIntake> dailyIntakes = repository.findByUserIdAndDate(userId, LocalDate.now());
        return dailyIntakes.stream().mapToInt(WaterIntake::getAmount).sum();
    }
}
