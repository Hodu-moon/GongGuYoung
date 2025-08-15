package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.*;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.*;

@Component
@RequiredArgsConstructor
public class DemandDepositClientImpl implements DemandDepositClient {
  private final FinOpenHttpClient finOpenHttpClient;

  @Override
  public CreateDemandDepositAccountResponse createDemandDepositAccount(CreateDemandDepositAccountRequest request) {
    String endPoint = "/edu/demandDeposit/createDemandDepositAccount";
    return finOpenHttpClient.post(endPoint, request, CreateDemandDepositAccountResponse.class);
  }

  @Override
  public InquireDemandDepositAccountListResponse inquireDemandDepositAccountList(
      InquireDemandDepositAccountListRequest request) {
    String endPoint = "/edu/demandDeposit/inquireDemandDepositAccountList";
    return finOpenHttpClient.post(endPoint, request, InquireDemandDepositAccountListResponse.class);
  }

  @Override
  public InquireDemandDepositAccountResponse inquireDemandDepositAccount(InquireDemandDepositAccountRequest request) {
    String endPoint = "/edu/demandDeposit/inquireDemandDepositAccount";
    return finOpenHttpClient.post(endPoint, request, InquireDemandDepositAccountResponse.class);
  }

  @Override
  public UpdateDemandDepositAccountTransferResponse updateDemandDepositAccountTransfer(
      UpdateDemandDepositAccountTransferRequest request) {
    String endPoint = "/edu/demandDeposit/updateDemandDepositAccountTransfer";
    return finOpenHttpClient.post(endPoint, request, UpdateDemandDepositAccountTransferResponse.class);
  }

  @Override
  public InquireTransactionHistoryListResponse inquireTransactionHistoryList(
      InquireTransactionHistoryListRequest request) {
    String endPoint = "/edu/demandDeposit/inquireTransactionHistoryList";
    return finOpenHttpClient.post(endPoint, request, InquireTransactionHistoryListResponse.class);
  }

  @Override
  public InquireTransactionHistoryResponse inquireTransactionHistory(InquireTransactionHistoryRequest request) {
    String endPoint = "/edu/demandDeposit/inquireTransactionHistory";
    return finOpenHttpClient.post(endPoint, request, InquireTransactionHistoryResponse.class);
  }

}
