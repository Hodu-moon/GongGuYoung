package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@ToString
@NoArgsConstructor
public class BankAccountRecord {
  // 은행 코드
  private String bankCode;

  // 은행명
  private String bankName;

  // 예금주명
  private String userName;

  // 계좌번호
  private String accountNo;

  // 상품명
  private String accountName;

  // 상품구분코드 1: 수시입출금, 2: 정기예금, 3: 정기적금, 4: 대출
  private String accountTypeCode;

  // 상품종류명
  private String accountTypeName;

  // 계좌개설일
  private String accountCreatedDate;

  // 계좌만기일
  private String accountExpiryDate;

  // 1일 이체 한도
  private String dailyTransferLimit;

  // 1회 이체 한도
  private String oneTimeTransferLimit;

  // 계좌 잔액
  private String accountBalance;

  // 최종거래일
  private String lastTransactionDate;

  // 통화코드
  private String currency;
}