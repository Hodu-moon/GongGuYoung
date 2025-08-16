package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.CurrencyRecord;

@Getter
@ToString(callSuper = true)
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class InquireBankCurrencyResponse extends BaseResponse {
  @JsonProperty("REC")
  private List<CurrencyRecord> records; 
}
