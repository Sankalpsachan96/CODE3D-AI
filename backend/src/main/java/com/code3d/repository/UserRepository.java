package com.code3d.repository;

import com.code3d.entity.UserRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserRecord, Long> {
    Optional<UserRecord> findByUsername(String username);
    Optional<UserRecord> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
