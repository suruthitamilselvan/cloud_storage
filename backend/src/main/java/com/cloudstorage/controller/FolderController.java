package com.cloudstorage.controller;

import com.cloudstorage.model.Folder;
import com.cloudstorage.security.UserPrincipal;
import com.cloudstorage.service.FolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    @Autowired
    private FolderService folderService;

    @PostMapping
    public ResponseEntity<Folder> createFolder(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String name = (String) body.get("name");
        UUID parentId = body.get("parentId") != null ? UUID.fromString(body.get("parentId").toString()) : null;

        return ResponseEntity.ok(folderService.createFolder(name, parentId, userPrincipal.getId()));
    }

    @GetMapping
    public ResponseEntity<List<Folder>> getFolders(
            @RequestParam(value = "parentId", required = false) UUID parentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(folderService.getFoldersInFolder(parentId, userPrincipal.getId()));
    }

    @GetMapping("/{id}/breadcrumbs")
    public ResponseEntity<List<Folder>> getBreadcrumbs(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(folderService.getBreadcrumbs(id, userPrincipal.getId()));
    }

    @DeleteMapping("/{id}/trash")
    public ResponseEntity<Folder> moveToTrash(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(folderService.moveToTrash(id, userPrincipal.getId()));
    }
}
