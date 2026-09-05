package com.cloudstorage.repository;

import com.cloudstorage.model.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface FileMetadataRepository extends JpaRepository<FileMetadata, UUID> {
    List<FileMetadata> findByOwnerIdAndFolderIdAndIsTrashedFalseAndIsEncryptedFalse(UUID ownerId, UUID folderId);
    List<FileMetadata> findByOwnerIdAndFolderIdIsNullAndIsTrashedFalseAndIsEncryptedFalse(UUID ownerId);
    List<FileMetadata> findByOwnerIdAndIsTrashedTrue(UUID ownerId);
    List<FileMetadata> findByOwnerIdAndIsStarredTrueAndIsTrashedFalse(UUID ownerId);
    List<FileMetadata> findByOwnerIdAndIsEncryptedTrueAndIsTrashedFalse(UUID ownerId);

    @Query("SELECT f FROM FileMetadata f WHERE f.ownerId = :ownerId AND f.isTrashed = false AND " +
           "(LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.tags) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.extractedText) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<FileMetadata> searchFiles(@Param("ownerId") UUID ownerId, @Param("query") String query);

    @Query("SELECT f.mimeType, SUM(f.size), COUNT(f) FROM FileMetadata f WHERE f.ownerId = :ownerId AND f.isTrashed = false GROUP BY f.mimeType")
    List<Object[]> getStorageBreakdownByMimeType(@Param("ownerId") UUID ownerId);
}
