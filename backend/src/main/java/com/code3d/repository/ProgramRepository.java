package com.code3d.repository;

import com.code3d.entity.ProgramRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramRepository extends JpaRepository<ProgramRecord, Long> {
    List<ProgramRecord> findTop20ByOrderByCreatedAtDesc();
}
