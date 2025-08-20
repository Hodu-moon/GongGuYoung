package xyz.jinjin99.gongguyoung.backend.domain.member.dto.request;

import lombok.Getter;

@Getter
public class LoginRequest {
    private String email;
    private String password;
}
