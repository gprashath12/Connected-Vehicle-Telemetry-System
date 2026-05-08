package com.telemetry.dto.admin;

import com.telemetry.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ClientDto {
    private Long userId;
    private String email;
    private String fullName;
    private String status;
    private String createdAt;

    public static ClientDto from(User u) {
        ClientDto d = new ClientDto();
        d.userId = u.getUserId();
        d.email = u.getEmail();
        d.fullName = u.getFullName();
        d.status = u.getStatus() != null ? u.getStatus() : "ACTIVE";
        d.createdAt = u.getCreatedAt().toString();
        return d;
    }
}
