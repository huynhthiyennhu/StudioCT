package com.htttdl.StudioCT.controller;

import com.htttdl.StudioCT.dto.*;
import com.htttdl.StudioCT.model.Studio;
import com.htttdl.StudioCT.model.StudioType;
import com.htttdl.StudioCT.model.Ward;
import com.htttdl.StudioCT.repository.StudioRepository;
import com.htttdl.StudioCT.exception.ResourceNotFoundException;
import com.htttdl.StudioCT.repository.StudioTypeRepository;
import com.htttdl.StudioCT.repository.WardRepository;
import com.htttdl.StudioCT.service.StudioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/studios")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class StudioController {
    @Autowired
    private StudioService studioService;

    @Autowired
    private StudioRepository studioRepository;

    @Autowired
    private StudioTypeRepository studioTypeRepository;


    @Autowired
    private WardRepository wardRepository;
    // API hiển thị tất cả các studio
    @GetMapping
    public ResponseEntity<List<StudioDTO>> getAllStudios() {
        List<Studio> studios = studioRepository.findAll();
        List<StudioDTO> studioDTOs = studios.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(studioDTOs);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<StudioDTO>> getStudiosByFilter(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String sortByRating, // ASC hoặc DESC
            @RequestParam(required = false) Long districtId) {

        // Lấy danh sách studio theo bộ lọc từ service
        List<Studio> studios = studioService.getStudiosByFilter(name, sortByRating, districtId);

        // Chuyển đổi từ entity sang DTO
        List<StudioDTO> studioDTOs = studios.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(studioDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudioDTO> getStudioById(@PathVariable Long id) {
        // Gọi service để lấy Studio
        Studio studio = studioService.getStudioById(id);

        // Chuyển đổi sang DTO
        StudioDTO studioDTO = convertToDTO(studio);

        return ResponseEntity.ok(studioDTO);
    }



    @PostMapping
    public ResponseEntity<StudioDTO> createStudio(@RequestBody StudioDTO studioDTO) {
        Studio studio = new Studio();
        studio.setName(studioDTO.getName());
        studio.setLatitude(studioDTO.getLatitude());
        studio.setLongitude(studioDTO.getLongitude());
        studio.setPhone(studioDTO.getPhone());
        studio.setRating(studioDTO.getRating());
        // Gán giá trị cho address
        if (studioDTO.getAddress() != null) {
            studio.setAddress(studioDTO.getAddress());
        } else {
            throw new IllegalArgumentException("Address is required");
        }
        // Xử lý Ward
        if (studioDTO.getWard() != null && studioDTO.getWard().getId() != null) {
            Ward ward = wardRepository.findById(studioDTO.getWard().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ward not found with id: " + studioDTO.getWard().getId()));
            studio.setWard(ward);
        } else {
            throw new IllegalArgumentException("Ward is required");
        }



        // Xử lý StudioType
        if (studioDTO.getStudioType() != null && studioDTO.getStudioType().getId() != null) {
            StudioType studioType = studioTypeRepository.findById(studioDTO.getStudioType().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("StudioType not found with id: " + studioDTO.getStudioType().getId()));
            studio.setStudioType(studioType);
        }
        studio.setThumbnail("default.png");
        Studio savedStudio = studioRepository.save(studio);
        return ResponseEntity.ok(convertToDTO(savedStudio));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudioDTO> updateStudio(
            @PathVariable Long id,
            @RequestBody StudioDTO studioDTO) {
        Studio studio = studioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found with id: " + id));

        studio.setName(studioDTO.getName());
        studio.setLatitude(studioDTO.getLatitude());
        studio.setLongitude(studioDTO.getLongitude());
        studio.setPhone(studioDTO.getPhone());
        studio.setRating(studioDTO.getRating());
        studio.setAddress(studioDTO.getAddress());
        // Cập nhật Ward
        if (studioDTO.getWard() != null && studioDTO.getWard().getId() != null) {
            Ward ward = wardRepository.findById(studioDTO.getWard().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ward not found with id: " + studioDTO.getWard().getId()));
            studio.setWard(ward);
        }



        // Cập nhật StudioType
        if (studioDTO.getStudioType() != null && studioDTO.getStudioType().getId() != null) {
            StudioType studioType = studioTypeRepository.findById(studioDTO.getStudioType().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("StudioType not found with id: " + studioDTO.getStudioType().getId()));
            studio.setStudioType(studioType);
        }

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

    @GetMapping("/nearby")
    public ResponseEntity<List<StudioDTO>> findStudiosNearby(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam double radius) {

        // Lấy tất cả các studio
        List<Studio> allStudios = studioRepository.findAll();

        // Lọc studio trong bán kính
        List<Studio> nearbyStudios = allStudios.stream()
                .filter(studio -> calculateDistance(latitude, longitude, studio.getLatitude(), studio.getLongitude()) <= radius)
                .collect(Collectors.toList());

        // Chuyển đổi sang DTO
        List<StudioDTO> studioDTOs = nearbyStudios.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(studioDTOs);
    }
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS = 6371; // Bán kính Trái Đất (kilomet)
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c; // Khoảng cách tính bằng kilomet
    }

    private StudioDTO convertToDTO(Studio studio) {
        StudioDTO dto = new StudioDTO();
        dto.setId(studio.getId());
        dto.setName(studio.getName());
        dto.setLatitude(studio.getLatitude());
        dto.setLongitude(studio.getLongitude());
        dto.setPhone(studio.getPhone());
        dto.setRating(studio.getRating());
        dto.setAddress(studio.getAddress());
        dto.setThumbnail(studio.getThumbnail());
        // Chuyển đổi StudioType chỉ lấy id và name
        if (studio.getStudioType() != null) {
            StudioTypeDTO studioTypeDTO = new StudioTypeDTO();
            studioTypeDTO.setId(studio.getStudioType().getId());
            studioTypeDTO.setName(studio.getStudioType().getName());
            dto.setStudioType(studioTypeDTO);
        }

        // Chuyển đổi Ward và District
        if (studio.getWard() != null) {
            WardDTO wardDTO = new WardDTO();
            wardDTO.setId(studio.getWard().getId());
            wardDTO.setName(studio.getWard().getName());

            // Bao gồm thông tin District trong Ward
            if (studio.getWard().getDistrict() != null) {
                DistrictDTO districtDTO = new DistrictDTO();
                districtDTO.setId(studio.getWard().getDistrict().getId());
                districtDTO.setName(studio.getWard().getDistrict().getName());
                wardDTO.setDistrict(districtDTO);
            }

            dto.setWard(wardDTO);
        }



        // Chuyển đổi danh sách ảnh
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
    @GetMapping("/district/{districtId}")
    public ResponseEntity<List<StudioDTO>> getStudiosByDistrict(@PathVariable Long districtId) {
        List<Studio> studios = studioRepository.findAll().stream()
                .filter(studio -> studio.getWard() != null &&
                        studio.getWard().getDistrict() != null &&
                        studio.getWard().getDistrict().getId().equals(districtId))
                .collect(Collectors.toList());

        List<StudioDTO> studioDTOs = studios.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(studioDTOs);
    }


}
