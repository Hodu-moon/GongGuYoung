package xyz.jinjin99.gongguyoung.backend.domain.notification.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FCMTokenRequest {

    @NotNull(message = "회원 ID는 필수입니다")
    private Long memberId;

    @NotBlank(message = "FCM 토큰은 필수입니다")
    private String token;

    private String deviceType;

    public FCMTokenRequest(Long memberId, String token, String deviceType) {
        this.memberId = memberId;
        this.token = token;
        this.deviceType = deviceType;
    }
}