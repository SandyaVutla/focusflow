package com.focusflow.water;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.time.LocalDate;

public interface WaterIntakeRepository extends MongoRepository<WaterIntake, String> {
    List<WaterIntake> findByUserIdAndDate(String userId, LocalDate date);
}
