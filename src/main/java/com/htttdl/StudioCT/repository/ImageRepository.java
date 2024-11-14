package com.htttdl.StudioCT.repository;

import com.htttdl.StudioCT.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    List<Image> findByStudioId(Long studioId);
}
