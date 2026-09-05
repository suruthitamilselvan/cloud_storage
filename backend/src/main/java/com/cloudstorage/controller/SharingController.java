package com.cloudstorage.controller;

import com.cloudstorage.dto.LinkShareRequest;
import com.cloudstorage.dto.ShareRequest;
import com.cloudstorage.model.FileMetadata;
import com.cloudstorage.model.LinkShare;
import com.cloudstorage.model.Share;
import com.cloudstorage.security.UserPrincipal;
import com.cloudstorage.service.SharingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shares")
public class SharingController {

    @Autowired
    private SharingService sharingService;

    @PostMapping
    public ResponseEntity<Share> shareItem(
            @Valid @RequestBody ShareRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(sharingService.shareItemWithUser(request, userPrincipal.getId()));
    }

    @GetMapping("/shared-with-me")
    public ResponseEntity<List<FileMetadata>> getSharedWithMe(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(sharingService.getFilesSharedWithUser(userPrincipal.getId()));
    }

    @PostMapping("/public-links")
    public ResponseEntity<LinkShare> createPublicLink(
            @RequestBody LinkShareRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(sharingService.createPublicLink(request, userPrincipal.getId()));
    }

    @PostMapping("/public/{token}")
    public ResponseEntity<FileMetadata> accessPublicFile(
            @PathVariable("token") String token,
            @RequestBody(required = false) Map<String, String> body) {
        String password = body != null ? body.get("password") : null;
        return ResponseEntity.ok(sharingService.accessPublicLinkFile(token, password));
    }
}
