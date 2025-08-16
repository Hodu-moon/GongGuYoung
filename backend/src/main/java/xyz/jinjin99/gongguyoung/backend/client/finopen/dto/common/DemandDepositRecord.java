package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@ToString
@NoArgsConstructor
public class DemandDepositRecord {
  private String accountTypeUniqueNo; // 상품 고유 코드
  private String bankCode;
  private String bankName;
  private String accountTypeCode; // 1: 수시입출금, 2: 정기예금, 3: 정기적금, 4: 대출
  private String accountTypeName;
  private String accountDescription;
  private String accountType; // DOMESTIC: 원화, OVERSEAS: 외화
}
