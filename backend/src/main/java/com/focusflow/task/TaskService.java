package com.focusflow.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class TaskService {
    @Autowired
    private TaskRepository repository;

    public List<Task> getTasks(String userId, LocalDate date) {
        if (date != null) {
            return repository.findByUserIdAndDate(userId, date);
        }
        return repository.findByUserId(userId);
    }

    public Task createTask(String userId, Task task) {
        task.setUserId(userId);
        if (task.getDate() == null)
            task.setDate(LocalDate.now());
        if (task.getStatus() == null)
            task.setStatus("ACTIVE");
        task.setCreatedAt(LocalDate.now());
        return repository.save(task);
    }

    public Task updateTask(String id, Task updatedTask) {
        return repository.findById(id).map(task -> {
            task.setTitle(updatedTask.getTitle());
            task.setCategory(updatedTask.getCategory());
            task.setTime(updatedTask.getTime());
            task.setPriority(updatedTask.getPriority());
            task.setDate(updatedTask.getDate());
            task.setStatus(updatedTask.getStatus());
            return repository.save(task);
        }).orElse(null);
    }

    public Task toggleTask(String id) {
        return repository.findById(id).map(task -> {
            task.setStatus("ACTIVE".equals(task.getStatus()) ? "COMPLETED" : "ACTIVE");
            return repository.save(task);
        }).orElse(null);
    }

    public void deleteTask(String id) {
        repository.deleteById(id);
    }
}
