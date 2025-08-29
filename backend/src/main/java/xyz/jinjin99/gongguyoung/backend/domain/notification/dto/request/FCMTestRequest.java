package xyz.jinjin99.gongguyoung.backend.domain.notification.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FCMTestRequest {

    @NotNull(message = "회원 ID는 필수입니다")
    private Long memberId;

    @NotBlank(message = "제목은 필수입니다")
    private String title;

    @NotBlank(message = "메시지는 필수입니다")
    private String message;

    public FCMTestRequest(Long memberId, String title, String message) {
        this.memberId = memberId;
        this.title = title;
        this.message = message;
    }
}