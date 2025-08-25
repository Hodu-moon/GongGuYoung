package xyz.jinjin99.gongguyoung.backend.domain.member.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MemberAccountsNo {
    String starterAccountNo;
    String flexAccountNo;
}
