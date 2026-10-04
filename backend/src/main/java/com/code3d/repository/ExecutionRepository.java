package com.code3d.repository;

import com.code3d.entity.ExecutionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExecutionRepository extends JpaRepository<ExecutionRecord, Long> {
    List<ExecutionRecord> findTop20ByOrderByExecutedAtDesc();
}
