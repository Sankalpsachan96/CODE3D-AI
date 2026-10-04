package com.code3d.service;

import com.code3d.entity.UserRecord;
import com.code3d.model.AuthRequest;
import com.code3d.model.AuthResponse;
import com.code3d.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void initDefaultUsers() {
        if (userRepository.count() == 0) {
            userRepository.save(new UserRecord(
                    "himanshu",
                    "himanshu@code3d.edu",
                    "admin123",
                    "Himanshu (Lead Architect)",
                    "Lead Architect",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            ));

            userRepository.save(new UserRecord(
                    "student.alex",
                    "alex@college.edu",
                    "student123",
                    "Alex Rivera",
                    "Student Developer",
                    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
            ));

            userRepository.save(new UserRecord(
                    "judge.exhibition",
                    "judge@techfest.org",
                    "judge123",
                    "Dr. Elena Vance (Judge)",
                    "Exhibition Evaluator",
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
            ));
        }
    }

    public AuthResponse login(AuthRequest request) {
        String identifier = request.getUsername();
        if (identifier == null || identifier.isBlank()) {
            identifier = request.getEmail();
        }

        if (identifier == null || identifier.isBlank()) {
            return AuthResponse.error("Username or email is required");
        }

        Optional<UserRecord> userOpt = userRepository.findByUsername(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(identifier);
        }

        if (userOpt.isEmpty()) {
            // For convenience in live student demos, if not found, allow quick auto-registration
            UserRecord newUser = new UserRecord(
                    identifier,
                    identifier.contains("@") ? identifier : identifier + "@code3d.edu",
                    request.getPassword() != null ? request.getPassword() : "demo123",
                    identifier.substring(0, 1).toUpperCase() + identifier.substring(1),
                    "Student Developer",
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
            );
            UserRecord saved = userRepository.save(newUser);
            return AuthResponse.success(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getFullName(), saved.getRole(), saved.getAvatarUrl());
        }

        UserRecord user = userOpt.get();
        // Check password if provided, or allow demo pass
        if (request.getPassword() != null && !request.getPassword().isBlank() &&
            !request.getPassword().equals(user.getPassword()) && !request.getPassword().equals("demo123")) {
            return AuthResponse.error("Invalid credentials provided");
        }

        return AuthResponse.success(user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getRole(), user.getAvatarUrl());
    }

    public AuthResponse register(AuthRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return AuthResponse.error("Username is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return AuthResponse.error("Email is required");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            return AuthResponse.error("Username is already taken");
        }

        String role = request.getRole() != null && !request.getRole().isBlank() ? request.getRole() : "Student Developer";
        String fullName = request.getFullName() != null && !request.getFullName().isBlank() ? request.getFullName() : request.getUsername();
        String avatar = request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()
                ? request.getAvatarUrl()
                : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

        UserRecord user = new UserRecord(
                request.getUsername(),
                request.getEmail(),
                request.getPassword() != null ? request.getPassword() : "demo123",
                fullName,
                role,
                avatar
        );

        UserRecord saved = userRepository.save(user);
        return AuthResponse.success(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getFullName(), saved.getRole(), saved.getAvatarUrl());
    }

    public AuthResponse demoLogin() {
        Optional<UserRecord> user = userRepository.findByUsername("himanshu");
        if (user.isPresent()) {
            UserRecord u = user.get();
            return AuthResponse.success(u.getId(), u.getUsername(), u.getEmail(), u.getFullName(), u.getRole(), u.getAvatarUrl());
        }
        return AuthResponse.success(1L, "himanshu", "himanshu@code3d.edu", "Himanshu (Lead Architect)", "Lead Architect", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
    }
}
