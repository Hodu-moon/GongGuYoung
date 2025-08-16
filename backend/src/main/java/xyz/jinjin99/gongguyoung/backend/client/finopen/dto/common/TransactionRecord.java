package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@ToString
@NoArgsConstructor
public class TransactionRecord {
  // 거래 고유 번호
  private Long transactionUniqueNo;
  // 거래 일자
  private String transactionDate;
  // 거래 시각
  private String transactionTime;
  // 입출금 구분 (1,2)
  private String transactionType;
  // 입출금 구분명 (입금, 출금, 입금(이체), 출금(이체))
  private String transactionTypeName;
  // 거래 계좌 번호
  private String transactionAccountNo;
  // 거래 금액
  private Long transactionBalance;
  // 거래후잔액
  private Long transactionAfterBalance;
  // 거래 요약 내용
  private String transactionSummary;
  // 거래 메모
  private String transactionMemo;
}
