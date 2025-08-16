package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.DemandDepositRecord;

@Getter
@ToString(callSuper = true)
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CreateDemandDepositResponse extends BaseResponse {
  @JsonProperty("REC")
  private DemandDepositRecord record;
}
