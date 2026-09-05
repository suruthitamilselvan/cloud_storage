package com.cloudstorage.controller;

import com.cloudstorage.model.FileComment;
import com.cloudstorage.model.FileMetadata;
import com.cloudstorage.security.UserPrincipal;
import com.cloudstorage.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<FileMetadata> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folderId", required = false) UUID folderId,
            @RequestParam(value = "isEncrypted", required = false, defaultValue = "false") Boolean isEncrypted,
            @RequestParam(value = "encryptionIv", required = false) String encryptionIv,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        FileMetadata metadata = fileService.uploadFile(file, folderId, userPrincipal.getId(), isEncrypted, encryptionIv);
        return ResponseEntity.ok(metadata);
    }

    @GetMapping
    public ResponseEntity<List<FileMetadata>> getFiles(
            @RequestParam(value = "folderId", required = false) UUID folderId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(fileService.getFilesInFolder(folderId, userPrincipal.getId()));
    }

    @GetMapping("/vault")
    public ResponseEntity<List<FileMetadata>> getVaultFiles(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(fileService.getVaultFiles(userPrincipal.getId()));
    }

    @GetMapping("/starred")
    public ResponseEntity<List<FileMetadata>> getStarredFiles(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(fileService.getStarredFiles(userPrincipal.getId()));
    }

    @GetMapping("/trash")
    public ResponseEntity<List<FileMetadata>> getTrashedFiles(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(fileService.getTrashedFiles(userPrincipal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileMetadata> getFileDetails(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(fileService.getFileMetadata(id, userPrincipal.getId()));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        FileMetadata metadata = fileService.getFileMetadata(id, userPrincipal.getId());
        Resource resource = fileService.loadFileResource(id, userPrincipal.getId());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(metadata.getMimeType() != null ? metadata.getMimeType() : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getOriginalName() + "\"")
                .body(resource);
    }

    @PostMapping("/{id}/star")
    public ResponseEntity<FileMetadata> toggleStar(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(fileService.toggleStar(id, userPrincipal.getId()));
    }

    @DeleteMapping("/{id}/trash")
    public ResponseEntity<FileMetadata> moveToTrash(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(fileService.moveToTrash(id, userPrincipal.getId()));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<FileMetadata> restoreFromTrash(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(fileService.restoreFromTrash(id, userPrincipal.getId()));
    }

    @DeleteMapping("/{id}/purge")
    public ResponseEntity<Void> deletePermanently(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        fileService.deletePermanently(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }

    // Visual Preview Comments
    @PostMapping("/{id}/comments")
    public ResponseEntity<FileComment> addComment(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        String content = (String) body.get("content");
        Double xPos = body.get("xPos") != null ? Double.parseDouble(body.get("xPos").toString()) : null;
        Double yPos = body.get("yPos") != null ? Double.parseDouble(body.get("yPos").toString()) : null;
        Integer page = body.get("pageNumber") != null ? Integer.parseInt(body.get("pageNumber").toString()) : 1;

        FileComment comment = fileService.addComment(id, content, xPos, yPos, page, userPrincipal.getId(), userPrincipal.getFullName());
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<FileComment>> getComments(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(fileService.getComments(id));
    }
}
