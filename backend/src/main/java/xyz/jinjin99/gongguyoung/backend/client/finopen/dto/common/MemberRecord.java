package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@ToString
@NoArgsConstructor
public class MemberRecord {
  private String userId;
  private String userName;
  private String institutionCode;
  private String userKey;
  private String created;
  private String modified;
}
