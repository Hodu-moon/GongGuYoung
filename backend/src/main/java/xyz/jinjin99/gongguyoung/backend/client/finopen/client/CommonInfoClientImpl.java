package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.BaseRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.BaseRequest.Header;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.InquireBankCodesResponse;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.InquireBankCurrencyResponse;

@Component
@RequiredArgsConstructor
public class CommonInfoClientImpl implements CommonInfoClient {

  private final FinOpenHttpClient finOpenHttpClient;
  private final ManagerClient managerClient;

  @Override
  public InquireBankCodesResponse inquireBankCodes() {
    String endpoint = "/edu/bank/inquireBankCodes";
    var request = BaseRequest.builder()
        .header(Header.builder()
            .apiKey(managerClient.getOrCreateApiKey())
            .build())
        .build();

    return finOpenHttpClient.post(endpoint, request, InquireBankCodesResponse.class);
  }

  @Override
  public InquireBankCurrencyResponse inquireBankCurrency() {
    String endpoint = "/edu/bank/inquireBankCurrency";
    var request = BaseRequest.builder()
        .header(Header.builder()
            .apiKey(managerClient.getOrCreateApiKey())
            .build())
        .build();

    return finOpenHttpClient.post(endpoint, request, InquireBankCurrencyResponse.class);
  }

}
