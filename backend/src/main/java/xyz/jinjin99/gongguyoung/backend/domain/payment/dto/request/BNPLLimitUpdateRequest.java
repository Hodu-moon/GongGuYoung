package xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BNPLLimitUpdateRequest {
    int limit;
}
