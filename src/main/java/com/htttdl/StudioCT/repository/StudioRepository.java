package com.htttdl.StudioCT.repository;

import com.htttdl.StudioCT.model.Studio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudioRepository extends JpaRepository<Studio, Long> {

    // Tìm studio trong hình tròn (bán kính)
    @Query(value = "SELECT *, (6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
            "cos(radians(longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(latitude)))) AS distance " +
            "FROM studios HAVING distance <= :radius ORDER BY distance", nativeQuery = true)
    List<Studio> findWithinCircle(double lat, double lng, double radius);

    // Tìm studio theo đánh giá
    List<Studio> findByRatingGreaterThanEqual(double rating);
}
