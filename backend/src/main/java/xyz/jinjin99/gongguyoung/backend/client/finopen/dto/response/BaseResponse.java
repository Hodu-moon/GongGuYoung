package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@ToString
@NoArgsConstructor
public class BaseResponse {
  @JsonProperty("Header")
  protected Header header;

  @Getter
  @ToString
  @NoArgsConstructor
  public static class Header {
    // 응답코드
    private String responseCode;

    // 응답메세지
    private String responseMessage;

    // 호출 API URL 마지막 PATH 명
    private String apiName;

    // API 전송일자 (YYYYMMDD) 요청일
    private String transmissionDate;

    // API 전송시각 (HHMMSS) 요청시간 기준 +-5
    private String transmissionTime;

    // 기관코드 "00100" 으로 고정
    private String institutionCode;

    // 핀테크 앱 일련번호 "001"으로 고정
    private String fintechAppNo;

    // apiName 이름 필드와 동일
    private String apiServiceCode;

    // 기관별 API 서비스 호출 단위의 고유 코드
    private String institutionTransactionUniqueNo;
  }
}
