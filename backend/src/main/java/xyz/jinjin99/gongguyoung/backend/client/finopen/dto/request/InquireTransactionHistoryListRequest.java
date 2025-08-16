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
public class InquireTransactionHistoryListRequest extends BaseRequest {
  // 계좌 번호
  private String accountNo;
  // 조회시작일자 (YYYYMMDD)
  private String startDate;
  // 조회 종료 일자 (YYYYMMDD)
  private String endDate;
  // 거래 구분(M: 입금, D: 출금, A: 전체)
  private String transactionType;
  // 정렬 순서 (ASC: 이전거래, DESC: 최근거래)
  private String orderByType;
}
