package com.focusflow.streak;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface StreakRepository extends MongoRepository<UserStreak, String> {
    Optional<UserStreak> findByUserId(String userId);
}
