package com.telemetry.security;

import com.telemetry.entity.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expiryMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiry-hours}") long expiryHours) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiryMs = expiryHours * 60L * 60L * 1000L;
    }

    public String generate(Long userId, String email, Role role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expiryMs)))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpirySeconds() {
        return expiryMs / 1000L;
    }
}
