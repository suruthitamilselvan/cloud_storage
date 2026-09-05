package com.cloudstorage.service;

import com.cloudstorage.model.FileMetadata;
import com.cloudstorage.repository.FileMetadataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SearchService {

    @Autowired
    private FileMetadataRepository fileMetadataRepository;

    public List<FileMetadata> searchFiles(String query, UUID userId) {
        if (query == null || query.trim().isBlank()) {
            return fileMetadataRepository.findByOwnerIdAndFolderIdIsNullAndIsTrashedFalseAndIsEncryptedFalse(userId);
        }
        return fileMetadataRepository.searchFiles(userId, query.trim());
    }
}
