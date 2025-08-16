package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.client.RestClient;

import lombok.RequiredArgsConstructor;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.MemberRecord;

@Component
@RequiredArgsConstructor
@Validated
public class MemberClientImpl implements MemberClient {

  private final ManagerClient managerClient;
  private final RestClient finOpenApiRestClient;

  @Override
  public MemberRecord createMember(String userId) {
    String endPoint = "/member";

    return finOpenApiRestClient.post()
        .uri(endPoint)
        .contentType(MediaType.APPLICATION_JSON)
        .body(Map.of("apiKey", managerClient.getOrCreateApiKey(), "userId", userId))
        .retrieve()
        .body(MemberRecord.class);
  }

  @Override
  public MemberRecord searchMember(String userId) {
    String endPoint = "/member/search";
    
    return finOpenApiRestClient.post()
        .uri(endPoint)
        .contentType(MediaType.APPLICATION_JSON)
        .body(Map.of("apiKey", managerClient.getOrCreateApiKey(), "userId", userId))
        .retrieve()
        .body(MemberRecord.class);
  }

}
