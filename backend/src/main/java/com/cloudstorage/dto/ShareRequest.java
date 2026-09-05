package com.cloudstorage.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class ShareRequest {
    private UUID fileId;
    private UUID folderId;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String role; // VIEWER or EDITOR
}
