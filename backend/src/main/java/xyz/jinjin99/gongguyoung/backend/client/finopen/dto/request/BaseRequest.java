package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
@ToString
@SuperBuilder(toBuilder = true)
@NoArgsConstructor
public class BaseRequest {
    @JsonProperty("Header")
    protected Header header;

    @Getter
    @ToString
    @Builder(toBuilder = true)
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Header {
        // 호출 API URL 마지막 PATH 명
        private String apiName;

        // API 전송일자 (YYYYMMDD) 요청일
        @Builder.Default
        private String transmissionDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // API 전송시각 (HHMMSS) 요청시간 기준 +-5
        @Builder.Default
        private String transmissionTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HHmmss"));

        // 기관코드 "00100" 으로 고정
        @Builder.Default
        private String institutionCode = "00100";

        // 핀테크 앱 일련번호 "001"으로 고정
        @Builder.Default
        private String fintechAppNo = "001";

        // apiName 이름 필드와 동일
        private String apiServiceCode;

        // 기관별 API 서비스 호출 단위의 고유 코드
        // 새로운 번호로 임의 채번(YYYYMMDD+HHMMSS+일련번호6자리) 또는 20자리의 난수
        // API 요청시 사용자가 항상 새로운 번호로 임의 채번해야함.
        @Builder.Default
        private String institutionTransactionUniqueNo = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + String.format("%06d", (int)(Math.random() * 1000000));

        // 개발자가 발급받은 API key
        private String apiKey;

        // 앱 사용자가 회원가입 할때 발급 받은 User Key
        private String userKey;
    }
}
