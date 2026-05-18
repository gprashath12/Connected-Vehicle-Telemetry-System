package com.telemetry.exception;

import com.telemetry.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── Auth ──────────────────────────────────────────────────────────────────

    @ExceptionHandler(EmailAlreadyRegisteredException.class)
    public ResponseEntity<ErrorResponse> handleEmailTaken(HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, "Email already registered", req);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "Invalid credentials", req);
    }

    // ── Client / Admin ────────────────────────────────────────────────────────

    @ExceptionHandler(ClientNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleClientNotFound(HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "Client not found", req);
    }

    @ExceptionHandler(NotAClientException.class)
    public ResponseEntity<ErrorResponse> handleNotAClient(HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "User is not a client", req);
    }

    @ExceptionHandler(RegistrationPlateExistsException.class)
    public ResponseEntity<ErrorResponse> handlePlateTaken(HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, "Registration plate already exists", req);
    }

    // ── Vehicle ───────────────────────────────────────────────────────────────

    @ExceptionHandler(VehicleNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleVehicleNotFound(HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "Vehicle not found", req);
    }

    @ExceptionHandler(VehicleAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleVehicleAccessDenied(HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "Not your vehicle", req);
    }

    // ── Spring / Framework ────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return build(HttpStatus.BAD_REQUEST, message, req);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "Access denied", req);
    }

    // ── Fallback ──────────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(HttpServletRequest req) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", req);
    }

    // ── Builder ───────────────────────────────────────────────────────────────

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, HttpServletRequest req) {
        return ResponseEntity.status(status.value()).body(new ErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                req.getRequestURI()
        ));
    }
}
