package com.cloudstorage.repository;

import com.cloudstorage.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FolderRepository extends JpaRepository<Folder, UUID> {
    List<Folder> findByOwnerIdAndParentIdAndIsTrashedFalse(UUID ownerId, UUID parentId);
    List<Folder> findByOwnerIdAndParentIdIsNullAndIsTrashedFalse(UUID ownerId);
    List<Folder> findByOwnerIdAndIsTrashedTrue(UUID ownerId);
    List<Folder> findByOwnerIdAndIsStarredTrueAndIsTrashedFalse(UUID ownerId);
    List<Folder> findByParentId(UUID parentId);
}
