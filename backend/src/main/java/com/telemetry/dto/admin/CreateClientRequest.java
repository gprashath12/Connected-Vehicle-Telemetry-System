package com.telemetry.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateClientRequest {

    @NotBlank
    @Size(max = 120)
    private String fullName;

    @NotBlank
    @Email
    private String email;

    @Size(min = 6, max = 100)
    private String password; // null/blank = auto-generate

    private String status = "ACTIVE"; // ACTIVE | INACTIVE
}
