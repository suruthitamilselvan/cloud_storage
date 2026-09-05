package com.cloudstorage.controller;

import com.cloudstorage.dto.AiChatRequest;
import com.cloudstorage.security.UserPrincipal;
import com.cloudstorage.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @GetMapping("/summarize/{fileId}")
    public ResponseEntity<Map<String, String>> summarizeFile(
            @PathVariable("fileId") UUID fileId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String summary = aiService.generateAiSummary(fileId, userPrincipal.getId());
        return ResponseEntity.ok(Map.of("summary", summary));
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chatWithDocument(
            @RequestBody AiChatRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String answer = aiService.chatWithDocument(request.getFileId(), request.getQuestion(), userPrincipal.getId());
        return ResponseEntity.ok(Map.of("answer", answer));
    }
}
