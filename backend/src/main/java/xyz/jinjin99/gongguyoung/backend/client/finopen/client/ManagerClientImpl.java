package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ManagerClientImpl implements ManagerClient {
  private final ParameterizedTypeReference<Map<String, String>> responseType = new ParameterizedTypeReference<Map<String, String>>() {};
  private final RestClient finOpenApiRestClient;

  @Value("${fin-open.member-id}")
  private String MEMBER_ID;

  private String API_KEY;  
  private LocalDateTime apiKeyTimestamp;

  @Override
  public String getOrCreateApiKey() {
    if (isApiKeyValid()) {
      log.debug("유효한 API Key 캐시 사용");
      return this.API_KEY;
    }
    
    return reissuedApiKey();
  }
  
  private boolean isApiKeyValid() {
    if (this.API_KEY == null || this.API_KEY.isEmpty()) {
      return false;
    }
    
    if (this.apiKeyTimestamp == null) {
      return false;
    }
    
    long hoursBetween = ChronoUnit.HOURS.between(this.apiKeyTimestamp, LocalDateTime.now());
    return hoursBetween < 8760;
  }

  private String reissuedApiKey() {
    try {
      log.info("API Key 재발급 요청 시작");

      Map<String, String> response = finOpenApiRestClient.post()
          .uri("/edu/app/reIssuedApiKey")
          .contentType(MediaType.APPLICATION_JSON)
          .body(Map.of("managerId", MEMBER_ID))
          .retrieve()
          .body(responseType);

      if (response == null || !response.containsKey("apiKey")) {
        throw new RuntimeException("API Key 응답이 올바르지 않습니다");
      }

      String apiKey = response.get("apiKey");
      this.API_KEY = apiKey;
      this.apiKeyTimestamp = LocalDateTime.now();
      
      log.info("API Key 재발급 완료");
      return apiKey;
      
    } catch (Exception e) {
      log.error("API Key 재발급 실패: {}", e.getMessage(), e);
      throw new RuntimeException("API Key 재발급 실패", e);
    }
  }

}