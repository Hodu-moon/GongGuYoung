package xyz.jinjin99.gongguyoung.backend.domain.member.dto.request;

import lombok.Data;

@Data
public class SignupRequest {
    private String email;
    private String password;
    private String name;
}
