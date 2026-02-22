package com.focusflow.focus;

import lombok.Data;

@Data
public class FocusStartRequest {
    private String taskId;

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }
}
