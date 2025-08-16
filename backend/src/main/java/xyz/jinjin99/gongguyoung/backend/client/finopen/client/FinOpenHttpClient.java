package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.BaseRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.BaseResponse;

@Slf4j
@Component
@RequiredArgsConstructor
public class FinOpenHttpClient {

  private final RestClient finOpenApiRestClient;
  private final ObjectMapper objectMapper;

  /**
   * POST 요청 공통 메서드 (endpoint에서 API명 자동 추출)
   */
  public <T extends BaseResponse> T post(String endpoint, BaseRequest request, Class<T> responseType) {
    String apiName = extractApiNameFromEndpoint(endpoint);

    BaseRequest updatedRequest = request.toBuilder()
        .header(request.getHeader().toBuilder()
            .apiName(apiName)
            .apiServiceCode(apiName)
            .build())
        .build();

    return executePost(endpoint, updatedRequest, responseType);
  }

  /**
   * endpoint에서 API명 추출
   */
  private String extractApiNameFromEndpoint(String endpoint) {
    String[] segments = endpoint.split("/");
    return segments[segments.length - 1];
  }

  /**
   * POST 요청 실행 메서드
   */
  private <T extends BaseResponse> T executePost(String endpoint, BaseRequest request, Class<T> responseType) {
    try {
      log.info("Finopen API 요청: {} -> {}", endpoint, objectMapper.writeValueAsString(request));

      T response = finOpenApiRestClient.post()
          .uri(endpoint)
          .contentType(MediaType.APPLICATION_JSON)
          .body(request)
          .retrieve()
          .body(responseType);

      log.info("Finopen API 응답: {} -> {}", endpoint, objectMapper.writeValueAsString(response));

      return response;

    } catch (Exception e) {
      log.error("Finopen API 호출 실패: {} - {}", endpoint, e.getMessage(), e);
      throw new RuntimeException("Finopen API 호출 실패", e);
    }
  }
}