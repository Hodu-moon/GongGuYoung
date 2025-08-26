package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ManagerClientImpl implements ManagerClient {

  @Value("${fin-open.member-id}")
  private String MEMBER_ID;

  @Value("${fin-open.api.key}")
  private String API_KEY;

  @Override
  public String getOrCreateApiKey() {
    log.debug("환경변수에서 API Key 반환");
    return this.API_KEY;
  }

}