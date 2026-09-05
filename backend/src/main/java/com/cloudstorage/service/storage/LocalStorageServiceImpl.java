package com.cloudstorage.service.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;

@Service
public class LocalStorageServiceImpl implements StorageService {

    @Value("${storage.local.upload-dir:./storage}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String key) {
        try {
            Path destinationFile = this.rootLocation.resolve(Paths.get(key)).normalize().toAbsolutePath();
            if (!destinationFile.getParent().equals(this.rootLocation)) {
                // Ensure subdirectories are created if key contains subfolders
                Files.createDirectories(destinationFile.getParent());
            }
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            return key;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + key, e);
        }
    }

    @Override
    public String storeStream(InputStream inputStream, String key, String mimeType, long length) {
        try {
            Path destinationFile = this.rootLocation.resolve(Paths.get(key)).normalize().toAbsolutePath();
            Files.createDirectories(destinationFile.getParent());
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            return key;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store stream " + key, e);
        }
    }

    @Override
    public Resource loadAsResource(String key) {
        try {
            Path file = rootLocation.resolve(key).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + key);
            }
        } catch (Exception e) {
            throw new RuntimeException("Could not read file: " + key, e);
        }
    }

    @Override
    public byte[] loadAsBytes(String key) {
        try {
            Path file = rootLocation.resolve(key).normalize();
            return Files.readAllBytes(file);
        } catch (IOException e) {
            throw new RuntimeException("Could not read bytes of file: " + key, e);
        }
    }

    @Override
    public void deleteFile(String key) {
        try {
            Path file = rootLocation.resolve(key).normalize();
            Files.deleteIfExists(file);
        } catch (IOException e) {
            // log error
        }
    }

    @Override
    public String generatePresignedDownloadUrl(String key, String originalName) {
        // For local storage, returns the direct API download path
        return "/api/files/download/" + key;
    }
}
