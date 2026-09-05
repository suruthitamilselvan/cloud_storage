package com.cloudstorage.controller;

import com.cloudstorage.model.FileMetadata;
import com.cloudstorage.security.UserPrincipal;
import com.cloudstorage.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping
    public ResponseEntity<List<FileMetadata>> search(
            @RequestParam("q") String query,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(searchService.searchFiles(query, userPrincipal.getId()));
    }
}
