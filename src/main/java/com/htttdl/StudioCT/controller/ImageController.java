package com.htttdl.StudioCT.controller;

import com.htttdl.StudioCT.dto.ImageDTO;
import com.htttdl.StudioCT.model.Image;
import com.htttdl.StudioCT.model.Studio;
import com.htttdl.StudioCT.repository.ImageRepository;
import com.htttdl.StudioCT.repository.StudioRepository;
import com.htttdl.StudioCT.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class ImageController {

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private StudioRepository studioRepository;

    // Lấy tất cả ảnh của một studio
    @GetMapping("/studio/{studioId}")
    public ResponseEntity<List<ImageDTO>> getImagesByStudioId(@PathVariable Long studioId) {
        List<Image> images = imageRepository.findByStudioId(studioId);
        List<ImageDTO> imageDTOs = images.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(imageDTOs);
    }

    // Thêm ảnh mới cho studio
    @PostMapping("/studio/{studioId}")
    public ResponseEntity<ImageDTO> addImageToStudio(@PathVariable Long studioId, @RequestBody ImageDTO imageDTO) {
        Studio studio = studioRepository.findById(studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found with id " + studioId));

        Image image = new Image();
        image.setStudio(studio);
        image.setImageUrl(imageDTO.getImageUrl());

        Image savedImage = imageRepository.save(image);
        return ResponseEntity.ok(convertToDTO(savedImage));
    }

    // Xóa ảnh theo ID
    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found with id " + imageId));
        imageRepository.delete(image);
        return ResponseEntity.noContent().build();
    }

    // Chuyển đổi từ Image sang ImageDTO
    private ImageDTO convertToDTO(Image image) {
        ImageDTO dto = new ImageDTO();
        dto.setId(image.getId());
        dto.setImageUrl(image.getImageUrl());
        return dto;
    }
}
