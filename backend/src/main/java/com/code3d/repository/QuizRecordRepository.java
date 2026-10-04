package com.code3d.repository;

import com.code3d.entity.QuizRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRecordRepository extends JpaRepository<QuizRecord, Long> {
    List<QuizRecord> findTop20ByOrderByCompletedAtDesc();
}
