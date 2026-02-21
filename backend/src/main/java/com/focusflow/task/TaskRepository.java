package com.focusflow.task;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.time.LocalDate;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByUserIdAndDate(String userId, LocalDate date);
}
