package com.cloudstorage.repository;

import com.cloudstorage.model.Star;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface StarRepository extends JpaRepository<Star, UUID> {
    Optional<Star> findByUserIdAndFileId(UUID userId, UUID fileId);
    Optional<Star> findByUserIdAndFolderId(UUID userId, UUID folderId);
    void deleteByUserIdAndFileId(UUID userId, UUID fileId);
    void deleteByUserIdAndFolderId(UUID userId, UUID folderId);
}
