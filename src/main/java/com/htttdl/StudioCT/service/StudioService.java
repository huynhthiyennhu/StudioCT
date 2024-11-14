package com.htttdl.StudioCT.service;

import com.htttdl.StudioCT.model.Studio;
import com.htttdl.StudioCT.exception.ResourceNotFoundException;
import com.htttdl.StudioCT.repository.StudioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudioService {
    @Autowired
    private StudioRepository studioRepository;

    public List<Studio> getAllStudios() {
        return studioRepository.findAll();
    }

    public Studio getStudioById(Long id) {
        return studioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found with id " + id));
    }

    public Studio createStudio(Studio studio) {
        return studioRepository.save(studio);
    }

    public Studio updateStudio(Long id, Studio studioDetails) {
        Studio studio = getStudioById(id);
        studio.setName(studioDetails.getName());
        studio.setAddress(studioDetails.getAddress());
        studio.setLatitude(studioDetails.getLatitude());
        studio.setLongitude(studioDetails.getLongitude());
        studio.setPhone(studioDetails.getPhone());
        studio.setType(studioDetails.getType());
        studio.setRating(studioDetails.getRating());
        return studioRepository.save(studio);
    }

    public void deleteStudio(Long id) {
        Studio studio = getStudioById(id);
        studioRepository.delete(studio);
    }

    public List<Studio> findStudiosNear(double latitude, double longitude, double radiusKm) {
        List<Studio> allStudios = studioRepository.findAll();
        return allStudios.stream()
                .filter(studio -> calculateDistance(latitude, longitude, studio.getLatitude(), studio.getLongitude()) <= radiusKm)
                .collect(Collectors.toList());
    }

    public List<Studio> getTopRatedStudios(int limit) {
        return studioRepository.findAll(Sort.by(Sort.Direction.DESC, "rating"))
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    public double calculateDistanceBetweenStudios(Long studio1Id, Long studio2Id) {
        Studio studio1 = getStudioById(studio1Id);
        Studio studio2 = getStudioById(studio2Id);
        return calculateDistance(studio1.getLatitude(), studio1.getLongitude(),
                studio2.getLatitude(), studio2.getLongitude());
    }

    // Hàm tính khoảng cách giữa hai điểm (Haversine formula)
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS = 6371; // Kilometers
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c;
    }
}
