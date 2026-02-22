package com.focusflow.stats;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface DailyStatsRepository extends MongoRepository<DailyStats, String> {
    Optional<DailyStats> findByUserIdAndDate(String userId, String date);

    List<DailyStats> findByUserIdAndDateBetween(String userId, String startDate, String endDate);

    List<DailyStats> findByUserId(String userId);
}
