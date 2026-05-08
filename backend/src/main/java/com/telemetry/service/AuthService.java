package com.telemetry.service;

import com.telemetry.dto.auth.LoginRequest;
import com.telemetry.dto.auth.RegisterRequest;
import com.telemetry.entity.Role;
import com.telemetry.entity.User;
import com.telemetry.repository.UserRepository;
import com.telemetry.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public record AuthResult(String token, User user) {}

    public AuthResult register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        User u = User.builder()
                .email(req.getEmail().trim().toLowerCase())
                .passwordHash(encoder.encode(req.getPassword()))
                .fullName(req.getFullName().trim())
                .role(Role.CLIENT)
                .createdAt(Instant.now())
                .build();
        u = userRepo.save(u);
        return new AuthResult(jwtService.generate(u.getUserId(), u.getEmail(), u.getRole()), u);
    }

    public AuthResult login(LoginRequest req) {
        User u = userRepo.findByEmail(req.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!encoder.matches(req.getPassword(), u.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        return new AuthResult(jwtService.generate(u.getUserId(), u.getEmail(), u.getRole()), u);
    }
}
