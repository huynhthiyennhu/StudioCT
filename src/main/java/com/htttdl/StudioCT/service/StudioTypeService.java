package com.htttdl.StudioCT.service;

import com.htttdl.StudioCT.model.StudioType;
import com.htttdl.StudioCT.repository.StudioTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudioTypeService {
    @Autowired
    private StudioTypeRepository studioTypeRepository;

    // Lấy tất cả loại studio
    public List<StudioType> getAllStudioTypes() {
        return studioTypeRepository.findAll();
    }

    // Lấy loại studio theo ID
    public StudioType getStudioTypeById(Long id) {
        return studioTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Studio type not found with id: " + id));
    }
}
