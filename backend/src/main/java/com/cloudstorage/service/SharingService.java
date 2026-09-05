package com.cloudstorage.service;

import com.cloudstorage.dto.LinkShareRequest;
import com.cloudstorage.dto.ShareRequest;
import com.cloudstorage.model.*;
import com.cloudstorage.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SharingService {

    @Autowired
    private ShareRepository shareRepository;

    @Autowired
    private LinkShareRepository linkShareRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileMetadataRepository fileMetadataRepository;

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public Share shareItemWithUser(ShareRequest request, UUID sharedByUserId) {
        User recipient = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User with email " + request.getEmail() + " not found"));

        Share share = Share.builder()
                .fileId(request.getFileId())
                .folderId(request.getFolderId())
                .sharedWithUserId(recipient.getId())
                .role(request.getRole() != null ? request.getRole() : "VIEWER")
                .sharedByUserId(sharedByUserId)
                .build();

        return shareRepository.save(share);
    }

    public List<FileMetadata> getFilesSharedWithUser(UUID userId) {
        List<Share> shares = shareRepository.findBySharedWithUserId(userId);
        List<FileMetadata> result = new ArrayList<>();

        for (Share share : shares) {
            if (share.getFileId() != null) {
                fileMetadataRepository.findById(share.getFileId()).ifPresent(result::add);
            }
        }
        return result;
    }

    @Transactional
    public LinkShare createPublicLink(LinkShareRequest request, UUID createdBy) {
        String token = UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        LinkShare linkShare = LinkShare.builder()
                .fileId(request.getFileId())
                .folderId(request.getFolderId())
                .shareToken(token)
                .expiresAt(request.getExpiresAt())
                .passwordHash(request.getPassword() != null && !request.getPassword().isBlank() ?
                        passwordEncoder.encode(request.getPassword()) : null)
                .role(request.getRole() != null ? request.getRole() : "VIEWER")
                .burnAfterReading(request.getBurnAfterReading() != null && request.getBurnAfterReading())
                .maxDownloads(request.getMaxDownloads())
                .accessCount(0)
                .createdBy(createdBy)
                .build();

        return linkShareRepository.save(linkShare);
    }

    @Transactional
    public FileMetadata accessPublicLinkFile(String token, String password) {
        LinkShare linkShare = linkShareRepository.findByShareToken(token)
                .orElseThrow(() -> new RuntimeException("Public share link not found or expired"));

        if (linkShare.getExpiresAt() != null && LocalDateTime.now().isAfter(linkShare.getExpiresAt())) {
            throw new IllegalStateException("This share link has expired!");
        }

        if (linkShare.getPasswordHash() != null) {
            if (password == null || !passwordEncoder.matches(password, linkShare.getPasswordHash())) {
                throw new SecurityException("Incorrect password required to access this file");
            }
        }

        if (linkShare.getFileId() == null) {
            throw new IllegalArgumentException("Link does not point to a single file");
        }

        FileMetadata file = fileMetadataRepository.findById(linkShare.getFileId())
                .orElseThrow(() -> new RuntimeException("File no longer exists"));

        // Update download/access count
        linkShare.setAccessCount(linkShare.getAccessCount() + 1);

        if (Boolean.TRUE.equals(linkShare.getBurnAfterReading())) {
            // Delete token after single access
            linkShareRepository.delete(linkShare);
        } else {
            linkShareRepository.save(linkShare);
        }

        return file;
    }
}
