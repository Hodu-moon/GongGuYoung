package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import java.util.Map;

import lombok.Getter;
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
public class ManagerClient {
  private final ParameterizedTypeReference<Map<String, String>> responseType = new ParameterizedTypeReference<Map<String, String>>() {};
  private final RestClient finOpenApiRestClient;

  @Value("${fin-open.member-id}")
  private String MEMBER_ID;
  @Getter
  private String cachedApiKey;

  public String reissuedApiKeyAndRegister() {
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
      this.cachedApiKey = apiKey;
      
      log.info("API Key 재발급 완료");
      return apiKey;
      
    } catch (Exception e) {
      log.error("API Key 재발급 실패: {}", e.getMessage(), e);
      throw new RuntimeException("API Key 재발급 실패", e);
    }
  }

}
