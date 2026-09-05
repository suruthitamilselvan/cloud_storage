package com.cloudstorage.repository;

import com.cloudstorage.model.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShareRepository extends JpaRepository<Share, UUID> {
    List<Share> findBySharedWithUserId(UUID sharedWithUserId);
    List<Share> findBySharedByUserId(UUID sharedByUserId);
    Optional<Share> findByFileIdAndSharedWithUserId(UUID fileId, UUID sharedWithUserId);
    Optional<Share> findByFolderIdAndSharedWithUserId(UUID folderId, UUID sharedWithUserId);
}
