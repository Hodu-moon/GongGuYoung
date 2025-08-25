package xyz.jinjin99.gongguyoung.backend.domain.member.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
@Schema(description = "로그인 request dto")
public class LoginRequest {
    @NotNull @Schema(description = "email 입니다.")
    private String email;
    @NotNull @Schema(description = "비밀번호입니다.")
    private String password;
}
