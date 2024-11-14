package com.htttdl.StudioCT.service;

import com.htttdl.StudioCT.model.Image;
import com.htttdl.StudioCT.repository.ImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class ImageService {
    @Autowired
    private ImageRepository imageRepository;

    public List<Image> getImagesByStudioId(Long studioId) {
        return imageRepository.findByStudioId(studioId);
    }

    public Image createImage(Image image) {
        return imageRepository.save(image);
    }
}

