package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.TransactionRecord;

import java.util.List;

@Getter
@ToString(callSuper = true)
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UpdateDemandDepositAccountDepositResponse extends BaseResponse{
    @JsonProperty("REC")
    private Record record;

    @Getter
    @NoArgsConstructor
    @ToString
    public static class Record {
        private Long transactionUniqueNo;
        private String transactionDate;
    }


}
