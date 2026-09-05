package com.cloudstorage.service;

import com.cloudstorage.dto.AnalyticsSummaryResponse;
import com.cloudstorage.model.Activity;
import com.cloudstorage.model.FileMetadata;
import com.cloudstorage.model.User;
import com.cloudstorage.repository.ActivityRepository;
import com.cloudstorage.repository.FileMetadataRepository;
import com.cloudstorage.repository.FolderRepository;
import com.cloudstorage.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileMetadataRepository fileMetadataRepository;

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private ActivityRepository activityRepository;

    public AnalyticsSummaryResponse getUserAnalytics(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<FileMetadata> files = fileMetadataRepository.findByOwnerIdAndFolderIdIsNullAndIsTrashedFalseAndIsEncryptedFalse(userId);
        // Fetch all non-trashed files for user
        List<Object[]> rawBreakdown = fileMetadataRepository.getStorageBreakdownByMimeType(userId);

        long totalStorageUsed = user.getStorageUsed();
        long totalLimit = user.getStorageLimit();

        Map<String, long[]> categoryMap = new HashMap<>();
        categoryMap.put("Images", new long[]{0, 0});
        categoryMap.put("Documents", new long[]{0, 0});
        categoryMap.put("Videos", new long[]{0, 0});
        categoryMap.put("Code & Text", new long[]{0, 0});
        categoryMap.put("Other", new long[]{0, 0});

        for (Object[] row : rawBreakdown) {
            String mimeType = row[0] != null ? (String) row[0] : "";
            long size = row[1] != null ? (Long) row[1] : 0L;
            long count = row[2] != null ? (Long) row[2] : 0L;

            String cat = getCategoryFromMime(mimeType);
            long[] current = categoryMap.get(cat);
            current[0] += size;
            current[1] += count;
        }

        List<AnalyticsSummaryResponse.CategoryBreakdown> breakdowns = new ArrayList<>();
        for (Map.Entry<String, long[]> entry : categoryMap.entrySet()) {
            long size = entry.getValue()[0];
            long count = entry.getValue()[1];
            double pct = totalStorageUsed > 0 ? (double) size / totalStorageUsed * 100.0 : 0.0;

            breakdowns.add(new AnalyticsSummaryResponse.CategoryBreakdown(
                    entry.getKey(),
                    size,
                    count,
                    Math.round(pct * 10.0) / 10.0
            ));
        }

        List<Activity> activities = activityRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, HH:mm");

        List<AnalyticsSummaryResponse.RecentActivityDto> activityDtos = activities.stream()
                .map(a -> new AnalyticsSummaryResponse.RecentActivityDto(
                        a.getAction(),
                        a.getTargetName() != null ? a.getTargetName() : "Item",
                        a.getCreatedAt() != null ? a.getCreatedAt().format(formatter) : "Recently"
                ))
                .collect(Collectors.toList());

        long folderCount = folderRepository.findByOwnerIdAndParentIdIsNullAndIsTrashedFalse(userId).size();

        return AnalyticsSummaryResponse.builder()
                .totalStorageUsed(totalStorageUsed)
                .totalStorageLimit(totalLimit)
                .totalFilesCount((long) files.size())
                .totalFoldersCount(folderCount)
                .categoryBreakdown(breakdowns)
                .recentActivities(activityDtos)
                .build();
    }

    private String getCategoryFromMime(String mimeType) {
        if (mimeType == null) return "Other";
        String lower = mimeType.toLowerCase();
        if (lower.contains("image")) return "Images";
        if (lower.contains("pdf") || lower.contains("msword") || lower.contains("officedocument")) return "Documents";
        if (lower.contains("video")) return "Videos";
        if (lower.contains("text") || lower.contains("json") || lower.contains("javascript") || lower.contains("code")) return "Code & Text";
        return "Other";
    }
}
