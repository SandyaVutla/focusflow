package com.focusflow.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    @Autowired
    private TaskService taskService;

    @GetMapping
    public List<Task> getTasks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return taskService.getTasks(userId, date);
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return taskService.createTask(userId, task);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Task> toggle(@PathVariable String id) {
        Task task = taskService.toggleTask(id);
        if (task == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
