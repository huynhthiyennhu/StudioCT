package com.htttdl.StudioCT.controller;

import com.htttdl.StudioCT.dto.DistrictDTO;
import com.htttdl.StudioCT.model.District;
import com.htttdl.StudioCT.repository.DistrictRepository;
import com.htttdl.StudioCT.service.DistrictService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/districts")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class DistrictController {
    @Autowired
    private DistrictService districtService;

    // API: Lấy danh sách tất cả các quận
    @GetMapping
    public ResponseEntity<List<DistrictDTO>> getAllDistricts() {
        List<District> districts = districtService.getAllDistricts();

        // Chuyển đổi danh sách District sang DTO
        List<DistrictDTO> districtDTOs = districts.stream()
                .map(district -> {
                    DistrictDTO dto = new DistrictDTO();
                    dto.setId(district.getId());
                    dto.setName(district.getName());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(districtDTOs);
    }

    // API: Lấy thông tin quận theo ID
    @GetMapping("/{id}")
    public ResponseEntity<DistrictDTO> getDistrictById(@PathVariable Long id) {
        District district = districtService.getDistrictById(id);

        // Chuyển đổi District sang DTO
        DistrictDTO dto = new DistrictDTO();
        dto.setId(district.getId());
        dto.setName(district.getName());

        return ResponseEntity.ok(dto);
    }
}
