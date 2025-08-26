package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@SuperBuilder(toBuilder = true)
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UpdateDemandDepositAccountTransferRequest extends BaseRequest {

  // 입금 계좌 번호
  private String depositAccountNo;
  // 거래 금액
  private Long transactionBalance;
  // 출금 계좌 번호
  private String withdrawalAccountNo;
  // 거래 요약 내용(입금 계좌)
  private String depositTransactionSummary;
  // 거래 요약 내용(출금 계좌)
  private String withdrawalTransactionSummary;
}
