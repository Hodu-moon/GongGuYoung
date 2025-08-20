package xyz.jinjin99.gongguyoung.backend.domain.member.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class MemberSummary {
    private Long id;
    private String email;
    private String name;
    private String userKey;

}
