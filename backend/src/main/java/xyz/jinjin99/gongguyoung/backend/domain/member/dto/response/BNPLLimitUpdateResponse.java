package xyz.jinjin99.gongguyoung.backend.domain.member.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BNPLLimitUpdateResponse {

    private int previousBnplLimit;
    private int updateBnplLimit;
}
