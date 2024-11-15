package com.htttdl.StudioCT.service;

import com.htttdl.StudioCT.dto.StudioDTO;
import com.htttdl.StudioCT.model.*;
import com.htttdl.StudioCT.exception.ResourceNotFoundException;
import com.htttdl.StudioCT.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudioService {
    @Autowired
    private StudioRepository studioRepository;
    @Autowired
    private StudioTypeRepository studioTypeRepository;

    @Autowired
    private WardRepository wardRepository;
    @Autowired
    private DistrictRepository districtRepository;

    // Lấy tất cả các quận
    public List<District> getAllDistricts() {
        return districtRepository.findAll();
    }

    // Lấy thông tin quận theo ID
    public District getDistrictById(Long id) {
        return districtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("District not found with id: " + id));
    }

    public List<Studio> getAllStudios() {
        return studioRepository.findAll();
    }


    // Hàm lấy studio theo ID (đã xử lý ngoại lệ)
    public Studio getStudioById(Long id) {
        return studioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found with id: " + id));
    }

    public Studio createStudio(Studio studio) {
        if (studio.getWard() != null && studio.getWard().getId() != null) {
            Ward ward = wardRepository.findById(studio.getWard().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ward not found with id: " + studio.getWard().getId()));
            studio.setWard(ward);

            // Kiểm tra và lấy District từ Ward (nếu cần)
            if (ward.getDistrict() != null) {
                District district = districtRepository.findById(ward.getDistrict().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("District not found with id: " + ward.getDistrict().getId()));
                ward.setDistrict(district);
            }
        }

        return studioRepository.save(studio);
    }

    public Studio updateStudio(Long id, Studio studioDetails) {
        Studio studio = getStudioById(id);

        studio.setName(studioDetails.getName());
        studio.setAddress(studioDetails.getAddress());
        studio.setLatitude(studioDetails.getLatitude());
        studio.setLongitude(studioDetails.getLongitude());
        studio.setPhone(studioDetails.getPhone());
        studio.setRating(studioDetails.getRating());

        if (studioDetails.getStudioType() != null && studioDetails.getStudioType().getId() != null) {
            StudioType studioType = studioTypeRepository.findById(studioDetails.getStudioType().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("StudioType not found with id: " + studioDetails.getStudioType().getId()));
            studio.setStudioType(studioType);
        }
        if (studioDetails.getWard() != null && studioDetails.getWard().getId() != null) {
            Ward ward = wardRepository.findById(studioDetails.getWard().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ward not found with id: " + studioDetails.getWard().getId()));
            studio.setWard(ward);

            // Kiểm tra và lấy District từ Ward (nếu cần)
            if (ward.getDistrict() != null) {
                District district = districtRepository.findById(ward.getDistrict().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("District not found with id: " + ward.getDistrict().getId()));
                ward.setDistrict(district);
            }
        }


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

    public List<Studio> getStudiosByFilter(String name, String sortByRating, Long districtId) {
        // Nếu tất cả các giá trị lọc đều null, trả về tất cả studio
        if ((name == null || name.isEmpty()) && sortByRating == null && districtId == null) {
            return studioRepository.findAll();
        }

        // Lấy tất cả studio
        List<Studio> studios = studioRepository.findAll();

        // Lọc theo tên (nếu có)
        if (name != null && !name.isEmpty()) {
            studios = studios.stream()
                    .filter(studio -> studio.getName().toLowerCase().contains(name.toLowerCase()))
                    .collect(Collectors.toList());
        }

        // Lọc theo quận (nếu có)
        if (districtId != null) {
            studios = studios.stream()
                    .filter(studio -> studio.getWard() != null &&
                            studio.getWard().getDistrict() != null &&
                            studio.getWard().getDistrict().getId().equals(districtId))
                    .collect(Collectors.toList());
        }

        // Sắp xếp theo đánh giá (nếu có)
        if (sortByRating != null) {
            if (sortByRating.equalsIgnoreCase("ASC")) {
                studios = studios.stream()
                        .sorted(Comparator.comparingDouble(Studio::getRating))
                        .collect(Collectors.toList());
            } else if (sortByRating.equalsIgnoreCase("DESC")) {
                studios = studios.stream()
                        .sorted(Comparator.comparingDouble(Studio::getRating).reversed())
                        .collect(Collectors.toList());
            }
        }

        return studios;
    }


}
