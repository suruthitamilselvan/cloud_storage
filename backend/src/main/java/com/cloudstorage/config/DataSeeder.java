package com.cloudstorage.config;

import com.cloudstorage.model.FileMetadata;
import com.cloudstorage.model.Folder;
import com.cloudstorage.model.User;
import com.cloudstorage.repository.FileMetadataRepository;
import com.cloudstorage.repository.FolderRepository;
import com.cloudstorage.repository.UserRepository;
import com.cloudstorage.service.storage.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private FileMetadataRepository fileMetadataRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private StorageService storageService;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("demo@cloudvault.com")) {
            User demoUser = User.builder()
                    .email("demo@cloudvault.com")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .fullName("Alex Mercer")
                    .role("ROLE_USER")
                    .authProvider("LOCAL")
                    .storageUsed(4294967296L) // 4GB
                    .storageLimit(16106127360L) // 15GB
                    .build();

            User savedUser = userRepository.save(demoUser);

            // Seed Sample Folders
            Folder f1 = folderRepository.save(Folder.builder()
                    .name("Projects & Architecture")
                    .ownerId(savedUser.getId())
                    .build());

            Folder f2 = folderRepository.save(Folder.builder()
                    .name("Financial Reports")
                    .ownerId(savedUser.getId())
                    .build());

            // Seed Sample Files
            fileMetadataRepository.save(FileMetadata.builder()
                    .name("Project_Architecture_Specification.pdf")
                    .originalName("Project_Architecture_Specification.pdf")
                    .size(2450000L)
                    .mimeType("application/pdf")
                    .storageKey("seed_spec.pdf")
                    .folderId(f1.getId())
                    .ownerId(savedUser.getId())
                    .isStarred(true)
                    .tags("work,pdf,spec")
                    .extractedText("CloudVault Architecture Specification: Enterprise meta file storage built with Java Spring Boot 3.2 backend and React frontend.")
                    .aiSummary("📄 **AI Document Executive Summary**: Project_Architecture_Specification.pdf\n• **Length**: ~450 words\n• **Status**: Indexed.")
                    .build());

            fileMetadataRepository.save(FileMetadata.builder()
                    .name("Q3_Financial_Audit_2026.xlsx")
                    .originalName("Q3_Financial_Audit_2026.xlsx")
                    .size(1850000L)
                    .mimeType("application/vnd.ms-excel")
                    .storageKey("seed_audit.xlsx")
                    .folderId(f2.getId())
                    .ownerId(savedUser.getId())
                    .isStarred(false)
                    .tags("financial,report")
                    .extractedText("Q3 Financial Audit Summary: Total revenue 1.2M USD.")
                    .build());
        }
    }
}
