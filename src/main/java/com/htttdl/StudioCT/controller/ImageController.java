package com.htttdl.StudioCT.controller;

import com.htttdl.StudioCT.dto.ImageDTO;
import com.htttdl.StudioCT.model.Image;
import com.htttdl.StudioCT.model.Studio;
import com.htttdl.StudioCT.repository.ImageRepository;
import com.htttdl.StudioCT.repository.StudioRepository;
import com.htttdl.StudioCT.exception.ResourceNotFoundException;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class ImageController {

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private StudioRepository studioRepository;

    private final String uploadDir = Paths.get("").toAbsolutePath().toString() + "/uploads"; // Đường dẫn tuyệt đối


    @GetMapping("/studio/{studioId}")
    public ResponseEntity<List<ImageDTO>> getImagesByStudioId(@PathVariable Long studioId) {
        List<Image> images = imageRepository.findByStudioId(studioId);
        List<ImageDTO> imageDTOs = images.stream()
                .map(image -> {
                    ImageDTO dto = new ImageDTO();
                    dto.setId(image.getId());
                    dto.setImageUrl(image.getImageUrl()); // Chỉ trả về tên ảnh
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(imageDTOs);
    }

    @PostMapping("/studio/{studioId}")
    public ResponseEntity<List<ImageDTO>> uploadImagesToStudio(@PathVariable Long studioId, @RequestParam("files") MultipartFile[] files) {
        // Kiểm tra studio tồn tại
        Studio studio = studioRepository.findById(studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found with id " + studioId));

        List<ImageDTO> imageDTOs = new ArrayList<>(); // Danh sách trả về các ảnh đã lưu

        for (MultipartFile file : files) {
            // Tạo tên file duy nhất
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName); // Đường dẫn đầy đủ

            try {
                Files.createDirectories(filePath.getParent()); // Tạo thư mục nếu chưa tồn tại
                file.transferTo(filePath.toFile()); // Lưu file vào server
            } catch (IOException e) {
                e.printStackTrace(); // Log lỗi
                throw new RuntimeException("Failed to save file: " + e.getMessage(), e);
            }

            // Lưu thông tin file vào database
            Image image = new Image();
            image.setStudio(studio);
            image.setImageUrl(fileName); // Lưu tên file
            Image savedImage = imageRepository.save(image);

            // Thêm ảnh vào danh sách trả về
            ImageDTO responseDTO = new ImageDTO();
            responseDTO.setId(savedImage.getId());
            responseDTO.setImageUrl(fileName);
            imageDTOs.add(responseDTO);
        }

        // Cập nhật thumbnail nếu cần
        if (studio.getThumbnail().equals("default.png") || studio.getImages().isEmpty()) {
            studio.setThumbnail(imageDTOs.get(0).getImageUrl()); // Lấy ảnh đầu tiên từ danh sách
            studioRepository.save(studio); // Lưu lại studio với thumbnail mới
        }

        return ResponseEntity.ok(imageDTOs);
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found with id " + imageId));

        // Xóa file vật lý
        Path filePath = Paths.get(uploadDir, image.getImageUrl());
        try {
            Files.deleteIfExists(filePath); // Xóa file nếu tồn tại
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file", e);
        }

        // Xóa bản ghi trong database
        imageRepository.delete(image);
        return ResponseEntity.noContent().build();
    }

    private ImageDTO convertToDTO(Image image) {
        ImageDTO dto = new ImageDTO();
        dto.setId(image.getId());
        dto.setImageUrl(image.getImageUrl()); // Chỉ trả về tên ảnh
        return dto;
    }

    @GetMapping("/view/{imageName}")
    public ResponseEntity<?> viewImage(@PathVariable String imageName) {
        try {
            // Đường dẫn tuyệt đối tới thư mục upload
            java.nio.file.Path imagePath = Paths.get(Paths.get("").toAbsolutePath().toString(), "uploads", imageName);
            UrlResource resource = new UrlResource(imagePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // Xác định loại nội dung
                String contentType = Files.probeContentType(imagePath);
                if (contentType == null) {
                    contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                // File không tồn tại, trả về ảnh notfound.jpg
                java.nio.file.Path fallbackImagePath = Paths.get(Paths.get("").toAbsolutePath().toString(), "uploads", "notfound.jpg");
                UrlResource fallbackResource = new UrlResource(fallbackImagePath.toUri());

                if (fallbackResource.exists() && fallbackResource.isReadable()) {
                    return ResponseEntity.ok()
                            .contentType(MediaType.IMAGE_JPEG)
                            .body(fallbackResource);
                } else {
                    return ResponseEntity.notFound().build();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error loading image: " + e.getMessage());
        }
    }

}
