package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.TransactionRecord;

@Getter
@ToString(callSuper = true)
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class InquireTransactionHistoryListResponse extends BaseResponse {
  @JsonProperty("REC")
  private Record record;

  @Getter
  @NoArgsConstructor
  @ToString
  public static class Record {
    private String totalCount;
    private List<TransactionRecord> list;
  }
  
}
