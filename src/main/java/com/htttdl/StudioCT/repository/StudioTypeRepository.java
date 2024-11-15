package com.htttdl.StudioCT.repository;

import com.htttdl.StudioCT.model.Studio;
import com.htttdl.StudioCT.model.StudioType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudioTypeRepository extends JpaRepository<StudioType, Long> {
}
