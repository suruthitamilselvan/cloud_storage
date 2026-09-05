package com.cloudstorage.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String action; // UPLOAD, RENAME, MOVE, DELETE, SHARE, RESTORE, VIEW_VAULT

    @Column(nullable = false)
    private String targetType; // FILE, FOLDER

    @Column(nullable = false)
    private UUID targetId;

    private String targetName;

    private String details;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
