package com.cloudstorage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsSummaryResponse {
    private Long totalStorageUsed;
    private Long totalStorageLimit;
    private Long totalFilesCount;
    private Long totalFoldersCount;
    private List<CategoryBreakdown> categoryBreakdown;
    private List<RecentActivityDto> recentActivities;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoryBreakdown {
        private String category; // Images, Documents, Videos, Code, Other
        private Long size; // bytes
        private Long fileCount;
        private Double percentage;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentActivityDto {
        private String action;
        private String targetName;
        private String formattedDate;
    }
}
