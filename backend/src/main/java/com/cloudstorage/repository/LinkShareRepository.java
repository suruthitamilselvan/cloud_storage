package com.cloudstorage.repository;

import com.cloudstorage.model.LinkShare;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface LinkShareRepository extends JpaRepository<LinkShare, UUID> {
    Optional<LinkShare> findByShareToken(String shareToken);
    Optional<LinkShare> findByFileId(UUID fileId);
    Optional<LinkShare> findByFolderId(UUID folderId);
}
