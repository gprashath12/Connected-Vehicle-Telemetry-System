package com.telemetry.dto.auth;

import com.telemetry.entity.Role;
import com.telemetry.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long userId;
    private String email;
    private String fullName;
    private Role role;

    public static UserDto from(User u) {
        return new UserDto(u.getUserId(), u.getEmail(), u.getFullName(), u.getRole());
    }
}
