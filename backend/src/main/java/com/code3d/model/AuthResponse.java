package com.code3d.model;

public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String avatarUrl;

    public AuthResponse() {}

    public static AuthResponse success(Long userId, String username, String email, String fullName, String role, String avatarUrl) {
        AuthResponse res = new AuthResponse();
        res.success = true;
        res.message = "Authentication successful";
        res.token = "code3d_jwt_" + username + "_" + System.currentTimeMillis();
        res.userId = userId;
        res.username = username;
        res.email = email;
        res.fullName = fullName;
        res.role = role;
        res.avatarUrl = avatarUrl;
        return res;
    }

    public static AuthResponse error(String message) {
        AuthResponse res = new AuthResponse();
        res.success = false;
        res.message = message;
        return res;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
