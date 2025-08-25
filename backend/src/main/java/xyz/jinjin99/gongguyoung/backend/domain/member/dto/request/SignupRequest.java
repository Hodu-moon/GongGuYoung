package xyz.jinjin99.gongguyoung.backend.domain.member.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "회원 가입 request dto")
public class SignupRequest {
    @NotNull
    @Schema(description = "회원 가입 이메일입니다.")
    private String email;
    @NotNull @Schema(description = "비밀번호 입니다.")
    private String password;
    @Schema(description = "이름입니다.")
    private String name;
}
