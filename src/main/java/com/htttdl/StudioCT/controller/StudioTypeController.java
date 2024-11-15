package com.htttdl.StudioCT.controller;

import com.htttdl.StudioCT.dto.StudioTypeDTO;
import com.htttdl.StudioCT.model.StudioType;
import com.htttdl.StudioCT.service.StudioTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/studio-types")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class StudioTypeController {
    @Autowired
    private StudioTypeService studioTypeService;

    // API: Lấy tất cả loại studio
    @GetMapping
    public ResponseEntity<List<StudioTypeDTO>> getAllStudioTypes() {
        List<StudioType> studioTypes = studioTypeService.getAllStudioTypes();
        // Chuyển đổi danh sách StudioType sang DTO
        List<StudioTypeDTO> studioTypeDTOs = studioTypes.stream()
                .map(studioType -> {
                    StudioTypeDTO dto = new StudioTypeDTO();
                    dto.setId(studioType.getId());
                    dto.setName(studioType.getName());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(studioTypeDTOs);
    }

    // API: Lấy loại studio theo ID
    @GetMapping("/{id}")
    public ResponseEntity<StudioTypeDTO> getStudioTypeById(@PathVariable Long id) {
        StudioType studioType = studioTypeService.getStudioTypeById(id);
        // Chuyển đổi StudioType sang DTO
        StudioTypeDTO dto = new StudioTypeDTO();
        dto.setId(studioType.getId());
        dto.setName(studioType.getName());
        return ResponseEntity.ok(dto);
    }
}
