package com.cloudstorage.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String originalName;

    @Column(nullable = false)
    private Long size; // in bytes

    private String mimeType;

    @Column(nullable = false)
    private String storageKey;

    private UUID folderId; // nullable for root files

    @Column(nullable = false)
    private UUID ownerId;

    @Builder.Default
    private Boolean isStarred = false;

    @Builder.Default
    private Boolean isTrashed = false;

    private LocalDateTime trashedAt;

    // Zero-Knowledge E2EE Support
    @Builder.Default
    private Boolean isEncrypted = false;
    private String encryptionIv;

    // Security & Virus Scan Status
    @Builder.Default
    private Boolean isSafe = true;
    @Builder.Default
    private String scanStatus = "CLEAN";

    // AI & Search Indexing
    @Lob
    @Column(columnDefinition = "TEXT")
    private String extractedText;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    private String tags; // Comma separated tags e.g. "invoice,pdf,tax"

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
