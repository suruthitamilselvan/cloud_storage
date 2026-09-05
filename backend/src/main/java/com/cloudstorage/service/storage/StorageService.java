package com.cloudstorage.service.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;

public interface StorageService {
    String storeFile(MultipartFile file, String key);
    String storeStream(InputStream inputStream, String key, String mimeType, long length);
    Resource loadAsResource(String key);
    byte[] loadAsBytes(String key);
    void deleteFile(String key);
    String generatePresignedDownloadUrl(String key, String originalName);
}
