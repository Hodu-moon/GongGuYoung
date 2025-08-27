package xyz.jinjin99.gongguyoung.backend.domain.member.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DepositResponse {

    // 통장 잔액
    private Long accountBalance;
    // 얼마 입금했는지
    private Long amount;
    // 시간
    private String createdAt;
}
