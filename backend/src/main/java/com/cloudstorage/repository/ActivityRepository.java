package com.cloudstorage.repository;

import com.cloudstorage.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {
    List<Activity> findTop20ByUserIdOrderByCreatedAtDesc(UUID userId);
}
