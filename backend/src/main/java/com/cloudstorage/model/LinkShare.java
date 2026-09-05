package com.cloudstorage.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "link_shares")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkShare {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID fileId;
    private UUID folderId;

    @Column(nullable = false, unique = true)
    private String shareToken;

    private LocalDateTime expiresAt;

    private String passwordHash;

    @Builder.Default
    private String role = "VIEWER"; // VIEWER or EDITOR

    @Builder.Default
    private Integer accessCount = 0;

    @Builder.Default
    private Boolean burnAfterReading = false;

    private Integer maxDownloads; // null = unlimited

    @Column(nullable = false)
    private UUID createdBy;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
