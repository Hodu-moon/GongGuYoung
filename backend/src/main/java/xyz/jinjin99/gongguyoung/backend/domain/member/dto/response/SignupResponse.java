package xyz.jinjin99.gongguyoung.backend.domain.member.dto.response;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.BnplLimit;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.KeywordAlert;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class SignupResponse {
    private Long id;
    private String name;
    private String email;
    private String userKey;
}
