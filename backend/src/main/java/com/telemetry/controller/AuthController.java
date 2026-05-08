package com.telemetry.controller;

import com.telemetry.dto.auth.LoginRequest;
import com.telemetry.dto.auth.RegisterRequest;
import com.telemetry.dto.auth.UserDto;
import com.telemetry.entity.User;
import com.telemetry.security.JwtService;
import com.telemetry.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    @Value("${jwt.cookie-name}")
    private String cookieName;

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterRequest req, HttpServletResponse res) {
        var result = authService.register(req);
        attachCookie(res, result.token());
        return ResponseEntity.ok(UserDto.from(result.user()));
    }

    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@Valid @RequestBody LoginRequest req, HttpServletResponse res) {
        var result = authService.login(req);
        attachCookie(res, result.token());
        return ResponseEntity.ok(UserDto.from(result.user()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse res) {
        Cookie c = new Cookie(cookieName, "");
        c.setHttpOnly(true);
        c.setPath("/");
        c.setMaxAge(0);
        c.setAttribute("SameSite", "Lax");
        res.addCookie(c);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(UserDto.from(currentUser));
    }

    private void attachCookie(HttpServletResponse res, String token) {
        // Use Set-Cookie header directly so we can set SameSite — Servlet Cookie API
        // doesn't expose SameSite portably across versions.
        String header = String.format(
                "%s=%s; Path=/; HttpOnly; Max-Age=%d; SameSite=Lax",
                cookieName, token, jwtService.getExpirySeconds()
        );
        res.addHeader("Set-Cookie", header);
    }
}
