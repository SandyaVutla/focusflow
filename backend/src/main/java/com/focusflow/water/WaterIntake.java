package com.focusflow.water;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@Document(collection = "water_intake")
public class WaterIntake {
    @Id
    private String id;
    private String userId;
    private int amount; // Number of glasses or volume
    private LocalDate date;

    public WaterIntake(String userId, int amount, LocalDate date) {
        this.userId = userId;
        this.amount = amount;
        this.date = date;
    }
}
