package com.cloudstorage.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class FileUploadInitRequest {
    private String name;
    private Long size;
    private String mimeType;
    private UUID folderId;
    private Boolean isEncrypted;
    private String encryptionIv;
}
