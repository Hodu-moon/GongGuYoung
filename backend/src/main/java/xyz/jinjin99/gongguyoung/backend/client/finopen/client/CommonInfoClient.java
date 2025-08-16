package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.InquireBankCodesResponse;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.InquireBankCurrencyResponse;

public interface CommonInfoClient {
  InquireBankCodesResponse inquireBankCodes();

  InquireBankCurrencyResponse inquireBankCurrency();
}
