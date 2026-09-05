package com.cloudstorage.repository;

import com.cloudstorage.model.FileComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FileCommentRepository extends JpaRepository<FileComment, UUID> {
    List<FileComment> findByFileIdOrderByCreatedAtAsc(UUID fileId);
}
