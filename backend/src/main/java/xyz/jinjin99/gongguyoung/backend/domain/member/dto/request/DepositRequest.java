package xyz.jinjin99.gongguyoung.backend.domain.member.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DepositRequest {
    private Long amount;
}
