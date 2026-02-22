package com.focusflow.water;

import lombok.Data;

@Data
public class WaterAddRequest {
    private int amount;

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }
}
