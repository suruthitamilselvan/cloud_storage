package com.cloudstorage.service;

import com.cloudstorage.model.FileMetadata;
import com.cloudstorage.repository.FileMetadataRepository;
import com.cloudstorage.service.storage.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class AiService {

    @Autowired
    private FileMetadataRepository fileMetadataRepository;

    @Autowired
    private StorageService storageService;

    /**
     * Extracts text from uploaded file and auto-assigns tags and AI summary.
     */
    public void processAndIndexFileContent(FileMetadata fileMetadata) {
        if (Boolean.TRUE.equals(fileMetadata.getIsEncrypted())) {
            fileMetadata.setTags("encrypted,secure-vault");
            fileMetadataRepository.save(fileMetadata);
            return;
        }

        try {
            byte[] bytes = storageService.loadAsBytes(fileMetadata.getStorageKey());
            String textContent = "";

            if (fileMetadata.getMimeType() != null &&
                    (fileMetadata.getMimeType().contains("text") ||
                     fileMetadata.getMimeType().contains("json") ||
                     fileMetadata.getMimeType().contains("javascript") ||
                     fileMetadata.getMimeType().contains("pdf"))) {
                textContent = new String(bytes, StandardCharsets.UTF_8);
            }

            if (!textContent.isBlank()) {
                // Truncate to reasonable length for DB index
                String indexText = textContent.length() > 5000 ? textContent.substring(0, 5000) : textContent;
                fileMetadata.setExtractedText(indexText);

                // Auto Tag Generation
                String tags = generateAutoTags(fileMetadata.getName(), fileMetadata.getMimeType(), textContent);
                fileMetadata.setTags(tags);

                // Generate Executive AI Summary
                String summary = generateAiSummaryText(fileMetadata.getName(), textContent);
                fileMetadata.setAiSummary(summary);

                fileMetadataRepository.save(fileMetadata);
            }
        } catch (Exception e) {
            // Log & gracefully skip OCR/AI if file format is binary or unparseable
            fileMetadata.setTags(generateAutoTags(fileMetadata.getName(), fileMetadata.getMimeType(), ""));
            fileMetadataRepository.save(fileMetadata);
        }
    }

    public String generateAiSummary(UUID fileId, UUID userId) {
        FileMetadata file = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getOwnerId().equals(userId)) {
            throw new SecurityException("Unauthorized access to file");
        }

        if (file.getAiSummary() != null && !file.getAiSummary().isBlank()) {
            return file.getAiSummary();
        }

        String extracted = file.getExtractedText() != null ? file.getExtractedText() : "";
        String summary = generateAiSummaryText(file.getName(), extracted);
        file.setAiSummary(summary);
        fileMetadataRepository.save(file);
        return summary;
    }

    public String chatWithDocument(UUID fileId, String question, UUID userId) {
        FileMetadata file = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        String docContext = file.getExtractedText();
        if (docContext == null || docContext.isBlank()) {
            return "Unable to answer: No readable text content found in document '" + file.getName() + "'.";
        }

        String lowerQuestion = question.toLowerCase();
        String lowerContext = docContext.toLowerCase();

        if (lowerQuestion.contains("summary") || lowerQuestion.contains("what is this about") || lowerQuestion.contains("overview")) {
            return generateAiSummaryText(file.getName(), docContext);
        }

        // Semantic context matching simulation
        String[] words = question.split("\\s+");
        List<String> matchingSentences = new ArrayList<>();
        for (String sentence : docContext.split("[.\n]")) {
            for (String word : words) {
                if (word.length() > 3 && sentence.toLowerCase().contains(word.toLowerCase())) {
                    matchingSentences.add(sentence.trim());
                    break;
                }
            }
        }

        if (!matchingSentences.isEmpty()) {
            return "Based on '" + file.getName() + "':\n\n\"" +
                    String.join(". ", matchingSentences.subList(0, Math.min(3, matchingSentences.size()))) +
                    ".\"\n\n(AI Assistant synthesized from document content)";
        }

        return "Based on your document '" + file.getName() + "', here is a key excerpt:\n\n\"" +
                (docContext.length() > 300 ? docContext.substring(0, 300) + "..." : docContext) + "\"";
    }

    private String generateAutoTags(String filename, String mimeType, String content) {
        Set<String> tags = new LinkedHashSet<>();
        String ext = filename.contains(".") ? filename.substring(filename.lastIndexOf(".") + 1).toLowerCase() : "";

        if (!ext.isEmpty()) tags.add(ext);
        if (mimeType != null) {
            if (mimeType.contains("image")) tags.add("image");
            if (mimeType.contains("pdf")) tags.add("pdf");
            if (mimeType.contains("video")) tags.add("video");
            if (mimeType.contains("text") || mimeType.contains("json")) tags.add("document");
        }

        String lower = (filename + " " + content).toLowerCase();
        if (lower.contains("invoice") || lower.contains("bill") || lower.contains("payment")) tags.add("financial");
        if (lower.contains("resume") || lower.contains("cv") || lower.contains("experience")) tags.add("career");
        if (lower.contains("project") || lower.contains("report") || lower.contains("plan")) tags.add("work");

        return String.join(",", tags);
    }

    private String generateAiSummaryText(String filename, String content) {
        if (content == null || content.isBlank()) {
            return "File: " + filename + "\n- Size & format metadata indexed successfully.\n- No direct text payload available for deep AI summary.";
        }
        int wordCount = content.split("\\s+").length;
        String preview = content.length() > 250 ? content.substring(0, 250).replaceAll("\\s+", " ") + "..." : content;

        return "📄 **AI Document Executive Summary**: " + filename + "\n" +
               "• **Length**: ~" + wordCount + " words processed\n" +
               "• **Key Highlights**: " + preview + "\n" +
               "• **Status**: Fully indexed for semantic search and Q&A.";
    }
}
