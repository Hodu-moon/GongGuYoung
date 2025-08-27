package xyz.jinjin99.gongguyoung.backend.domain.member.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MemberStarterAccountResponse {
    private Long memberId;
    private Integer starterBalance;
}
