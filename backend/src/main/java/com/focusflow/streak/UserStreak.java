package com.focusflow.streak;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@Document(collection = "user_streaks")
public class UserStreak {
    @Id
    private String id;
    private String userId;
    private int currentStreak;
    private int bestStreak;
    private LocalDate lastSuccessfulDate;

    public UserStreak(String userId) {
        this.userId = userId;
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.lastSuccessfulDate = LocalDate.now().minusDays(2); // Initial state: no recent success
    }
}
