package com.cloudstorage.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class AiChatRequest {
    private UUID fileId;
    private String question;
}
