package com.htttdl.StudioCT.service;

import com.htttdl.StudioCT.model.District;
import com.htttdl.StudioCT.repository.DistrictRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DistrictService {
    @Autowired
    private DistrictRepository districtRepository;

    // Lấy danh sách tất cả quận
    public List<District> getAllDistricts() {
        return districtRepository.findAll();
    }

    // Lấy thông tin quận theo ID
    public District getDistrictById(Long id) {
        return districtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("District not found with id: " + id));
    }
}
