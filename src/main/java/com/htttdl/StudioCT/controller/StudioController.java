package com.htttdl.StudioCT.controller;

import com.htttdl.StudioCT.dto.ImageDTO;
import com.htttdl.StudioCT.dto.StudioDTO;
import com.htttdl.StudioCT.model.Studio;
import com.htttdl.StudioCT.repository.StudioRepository;
import com.htttdl.StudioCT.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/studios")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class StudioController {

    @Autowired
    private StudioRepository studioRepository;
    // API hiển thị tất cả các studio
    @GetMapping
    public ResponseEntity<List<StudioDTO>> getAllStudios() {
        List<Studio> studios = studioRepository.findAll();
        List<StudioDTO> studioDTOs = studios.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(studioDTOs);
    }

    // Thêm studio mới với tọa độ được chọn từ bản đồ
    @PostMapping
    public ResponseEntity<StudioDTO> createStudio(@RequestBody StudioDTO studioDTO) {
        Studio studio = new Studio();
        studio.setName(studioDTO.getName());
        studio.setAddress(studioDTO.getAddress());
        studio.setLatitude(studioDTO.getLatitude());
        studio.setLongitude(studioDTO.getLongitude());
        studio.setPhone(studioDTO.getPhone());
        studio.setType(studioDTO.getType());
        studio.setRating(studioDTO.getRating());

        Studio savedStudio = studioRepository.save(studio);
        return ResponseEntity.ok(convertToDTO(savedStudio));
    }

    // Cập nhật studio theo ID
    @PutMapping("/{id}")
    public ResponseEntity<StudioDTO> updateStudio(
            @PathVariable Long id,
            @RequestBody StudioDTO studioDTO) {
        Studio studio = studioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found with id " + id));

        studio.setName(studioDTO.getName());
        studio.setAddress(studioDTO.getAddress());
        studio.setLatitude(studioDTO.getLatitude());
        studio.setLongitude(studioDTO.getLongitude());
        studio.setPhone(studioDTO.getPhone());
        studio.setType(studioDTO.getType());
        studio.setRating(studioDTO.getRating());

        Studio updatedStudio = studioRepository.save(studio);
        return ResponseEntity.ok(convertToDTO(updatedStudio));
    }

    // Xóa studio theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudio(@PathVariable Long id) {
        Studio studio = studioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found with id " + id));
        studioRepository.delete(studio);
        return ResponseEntity.noContent().build();
    }

    // Tìm kiếm studio theo đánh giá
    @GetMapping("/filter-by-rating")
    public ResponseEntity<List<StudioDTO>> filterStudiosByRating(@RequestParam double rating) {
        List<Studio> studios = studioRepository.findByRatingGreaterThanEqual(rating);
        List<StudioDTO> studioDTOs = studios.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(studioDTOs);
    }

    // Tìm studio gần vị trí người dùng trong bán kính
    @GetMapping("/nearby")
    public ResponseEntity<List<StudioDTO>> findStudiosNearby(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam double radius) {
        List<Studio> studios = studioRepository.findWithinCircle(latitude, longitude, radius);
        List<StudioDTO> studioDTOs = studios.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(studioDTOs);
    }

    // Chuyển đổi từ Studio sang StudioDTO, bao gồm danh sách ảnh
    private StudioDTO convertToDTO(Studio studio) {
        StudioDTO dto = new StudioDTO();
        dto.setId(studio.getId());
        dto.setName(studio.getName());
        dto.setAddress(studio.getAddress());
        dto.setLatitude(studio.getLatitude());
        dto.setLongitude(studio.getLongitude());
        dto.setPhone(studio.getPhone());
        dto.setType(studio.getType());
        dto.setRating(studio.getRating());

        if (studio.getImages() != null) {
            List<ImageDTO> imageDTOs = studio.getImages().stream().map(image -> {
                ImageDTO imageDTO = new ImageDTO();
                imageDTO.setId(image.getId());
                imageDTO.setImageUrl(image.getImageUrl());
                return imageDTO;
            }).collect(Collectors.toList());
            dto.setImages(imageDTOs);
        }

        return dto;
    }
}
