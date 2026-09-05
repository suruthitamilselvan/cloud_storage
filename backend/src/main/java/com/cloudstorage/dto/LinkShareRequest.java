package com.cloudstorage.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class LinkShareRequest {
    private UUID fileId;
    private UUID folderId;
    private LocalDateTime expiresAt;
    private String password;
    private String role; // VIEWER or EDITOR
    private Boolean burnAfterReading;
    private Integer maxDownloads;
}
