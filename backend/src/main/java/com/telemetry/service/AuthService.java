package com.telemetry.service;

import com.telemetry.dto.auth.LoginRequest;
import com.telemetry.dto.auth.RegisterRequest;
import com.telemetry.entity.Role;
import com.telemetry.entity.User;
import com.telemetry.exception.EmailAlreadyRegisteredException;
import com.telemetry.exception.InvalidCredentialsException;
import com.telemetry.repository.UserRepository;
import com.telemetry.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
            throw new EmailAlreadyRegisteredException();
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
                .orElseThrow(InvalidCredentialsException::new);
        if (!encoder.matches(req.getPassword(), u.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        return new AuthResult(jwtService.generate(u.getUserId(), u.getEmail(), u.getRole()), u);
    }
}
