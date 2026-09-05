package com.cloudstorage.service;

import com.cloudstorage.model.Activity;
import com.cloudstorage.model.Folder;
import com.cloudstorage.repository.ActivityRepository;
import com.cloudstorage.repository.FolderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class FolderService {

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private ActivityRepository activityRepository;

    public Folder createFolder(String name, UUID parentId, UUID userId) {
        Folder folder = Folder.builder()
                .name(name)
                .parentId(parentId)
                .ownerId(userId)
                .build();
        Folder saved = folderRepository.save(folder);

        activityRepository.save(Activity.builder()
                .userId(userId)
                .action("CREATE_FOLDER")
                .targetType("FOLDER")
                .targetId(saved.getId())
                .targetName(saved.getName())
                .details("Created folder " + name)
                .build());

        return saved;
    }

    public List<Folder> getFoldersInFolder(UUID parentId, UUID userId) {
        if (parentId == null) {
            return folderRepository.findByOwnerIdAndParentIdIsNullAndIsTrashedFalse(userId);
        }
        return folderRepository.findByOwnerIdAndParentIdAndIsTrashedFalse(userId, parentId);
    }

    public List<Folder> getTrashedFolders(UUID userId) {
        return folderRepository.findByOwnerIdAndIsTrashedTrue(userId);
    }

    public Folder getFolder(UUID folderId, UUID userId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));
        if (!folder.getOwnerId().equals(userId)) {
            throw new SecurityException("Access denied");
        }
        return folder;
    }

    public List<Folder> getBreadcrumbs(UUID folderId, UUID userId) {
        List<Folder> breadcrumbs = new ArrayList<>();
        UUID currentId = folderId;

        while (currentId != null) {
            Folder folder = getFolder(currentId, userId);
            breadcrumbs.add(0, folder); // prepending
            currentId = folder.getParentId();
        }

        return breadcrumbs;
    }

    @Transactional
    public Folder moveToTrash(UUID folderId, UUID userId) {
        Folder folder = getFolder(folderId, userId);
        folder.setIsTrashed(true);
        folder.setTrashedAt(LocalDateTime.now());
        return folderRepository.save(folder);
    }

    @Transactional
    public Folder restoreFromTrash(UUID folderId, UUID userId) {
        Folder folder = getFolder(folderId, userId);
        folder.setIsTrashed(false);
        folder.setTrashedAt(null);
        return folderRepository.save(folder);
    }
}
