package com.cloudstorage.service;

import com.cloudstorage.dto.FileUploadInitRequest;
import com.cloudstorage.model.*;
import com.cloudstorage.repository.*;
import com.cloudstorage.service.storage.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class FileService {

    @Autowired
    private FileMetadataRepository fileMetadataRepository;

    @Autowired
    private FileVersionRepository fileVersionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StorageService storageService;

    @Autowired
    private AiService aiService;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private StarRepository starRepository;

    @Autowired
    private FileCommentRepository fileCommentRepository;

    @Transactional
    public FileMetadata uploadFile(MultipartFile file, UUID folderId, UUID userId, Boolean isEncrypted, String encryptionIv) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStorageUsed() + file.getSize() > user.getStorageLimit()) {
            throw new IllegalStateException("Storage quota exceeded! Please upgrade your plan.");
        }

        String storageKey = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        storageService.storeFile(file, storageKey);

        FileMetadata metadata = FileMetadata.builder()
                .name(file.getOriginalFilename())
                .originalName(file.getOriginalFilename())
                .size(file.getSize())
                .mimeType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .storageKey(storageKey)
                .folderId(folderId)
                .ownerId(userId)
                .isEncrypted(isEncrypted != null && isEncrypted)
                .encryptionIv(encryptionIv)
                .isSafe(true)
                .scanStatus("CLEAN")
                .build();

        FileMetadata saved = fileMetadataRepository.save(metadata);

        // Update user storage used
        user.setStorageUsed(user.getStorageUsed() + file.getSize());
        userRepository.save(user);

        // Create initial File Version (Version 1)
        FileVersion version = FileVersion.builder()
                .fileId(saved.getId())
                .versionNumber(1)
                .storageKey(storageKey)
                .size(file.getSize())
                .createdBy(userId)
                .build();
        fileVersionRepository.save(version);

        // Trigger AI background indexing
        aiService.processAndIndexFileContent(saved);

        // Audit Log
        activityRepository.save(Activity.builder()
                .userId(userId)
                .action("UPLOAD")
                .targetType("FILE")
                .targetId(saved.getId())
                .targetName(saved.getName())
                .details("Uploaded file of size " + file.getSize() + " bytes")
                .build());

        return saved;
    }

    public List<FileMetadata> getFilesInFolder(UUID folderId, UUID userId) {
        if (folderId == null) {
            return fileMetadataRepository.findByOwnerIdAndFolderIdIsNullAndIsTrashedFalseAndIsEncryptedFalse(userId);
        }
        return fileMetadataRepository.findByOwnerIdAndFolderIdAndIsTrashedFalseAndIsEncryptedFalse(userId, folderId);
    }

    public List<FileMetadata> getVaultFiles(UUID userId) {
        return fileMetadataRepository.findByOwnerIdAndIsEncryptedTrueAndIsTrashedFalse(userId);
    }

    public List<FileMetadata> getStarredFiles(UUID userId) {
        return fileMetadataRepository.findByOwnerIdAndIsStarredTrueAndIsTrashedFalse(userId);
    }

    public List<FileMetadata> getTrashedFiles(UUID userId) {
        return fileMetadataRepository.findByOwnerIdAndIsTrashedTrue(userId);
    }

    public FileMetadata getFileMetadata(UUID fileId, UUID userId) {
        FileMetadata file = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        if (!file.getOwnerId().equals(userId)) {
            throw new SecurityException("Access denied");
        }
        return file;
    }

    public Resource loadFileResource(UUID fileId, UUID userId) {
        FileMetadata file = getFileMetadata(fileId, userId);
        return storageService.loadAsResource(file.getStorageKey());
    }

    @Transactional
    public FileMetadata toggleStar(UUID fileId, UUID userId) {
        FileMetadata file = getFileMetadata(fileId, userId);
        file.setIsStarred(!file.getIsStarred());

        if (file.getIsStarred()) {
            starRepository.save(Star.builder().userId(userId).fileId(fileId).build());
        } else {
            starRepository.deleteByUserIdAndFileId(userId, fileId);
        }

        return fileMetadataRepository.save(file);
    }

    @Transactional
    public FileMetadata moveToTrash(UUID fileId, UUID userId) {
        FileMetadata file = getFileMetadata(fileId, userId);
        file.setIsTrashed(true);
        file.setTrashedAt(LocalDateTime.now());

        activityRepository.save(Activity.builder()
                .userId(userId)
                .action("DELETE")
                .targetType("FILE")
                .targetId(file.getId())
                .targetName(file.getName())
                .details("Moved to trash")
                .build());

        return fileMetadataRepository.save(file);
    }

    @Transactional
    public FileMetadata restoreFromTrash(UUID fileId, UUID userId) {
        FileMetadata file = getFileMetadata(fileId, userId);
        file.setIsTrashed(false);
        file.setTrashedAt(null);

        activityRepository.save(Activity.builder()
                .userId(userId)
                .action("RESTORE")
                .targetType("FILE")
                .targetId(file.getId())
                .targetName(file.getName())
                .details("Restored from trash")
                .build());

        return fileMetadataRepository.save(file);
    }

    @Transactional
    public void deletePermanently(UUID fileId, UUID userId) {
        FileMetadata file = getFileMetadata(fileId, userId);
        storageService.deleteFile(file.getStorageKey());

        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setStorageUsed(Math.max(0L, user.getStorageUsed() - file.getSize()));
            userRepository.save(user);
        }

        fileMetadataRepository.delete(file);
    }

    public FileComment addComment(UUID fileId, String content, Double xPos, Double yPos, Integer pageNumber, UUID userId, String userFullName) {
        FileComment comment = FileComment.builder()
                .fileId(fileId)
                .userId(userId)
                .userFullName(userFullName)
                .content(content)
                .xPos(xPos)
                .yPos(yPos)
                .pageNumber(pageNumber)
                .build();
        return fileCommentRepository.save(comment);
    }

    public List<FileComment> getComments(UUID fileId) {
        return fileCommentRepository.findByFileIdOrderByCreatedAtAsc(fileId);
    }
}
