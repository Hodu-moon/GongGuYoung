package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;


@Getter
@ToString(callSuper = true)
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class InquireDemandDepositAccountBalanceResponse extends BaseResponse{

    // 계좌 정보
    @JsonProperty("REC")
    private Record record;

    @Getter
    @NoArgsConstructor
    @ToString
    static public class Record {
        // 은행 코드
        private String bankCode;

        // 계좌 번호
        private String accountNo;

        // 계좌잔액
        private Long accountBalance;

        // 계좌개설일
        private String accountCreatedDate;

        // 계좌만기일
        private String accountExpiryDate;

        // 최종거래일
        private String lastTransactionDate;

        // 통화코드
        private String currency;

    }
}
