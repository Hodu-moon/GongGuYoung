package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.*;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.*;

public interface DemandDepositClient {

  /**
   * 수시입출금 상품 등록
   * userKey는 사용 안함
   * @param request 상품 생성 Request
   * @return 생성한 결과값
   */
  CreateDemandDepositResponse createDemandDeposit(CreateDemandDepositRequest request);

  /**
   * 수시입출금 상품들 조회
   * userKey는 사용 안함
   * @param request apiKey만 담긴 기본 헤더
   * @return 조회한 결과값
   */
  InquireDemandDepositListResponse inquireDemandDepositList(InquireDemandDepositListRequest request);

  /**
   * 계좌 생성
   * 
   * @return
   */
  CreateDemandDepositAccountResponse createDemandDepositAccount(CreateDemandDepositAccountRequest request);

  /**
   * 계좌 목록 조회
   * 
   * @return
   */
  InquireDemandDepositAccountListResponse inquireDemandDepositAccountList(
      InquireDemandDepositAccountListRequest request);

  /**
   * 계좌 단건 조회
   * 
   * @return
   */
  InquireDemandDepositAccountResponse inquireDemandDepositAccount(InquireDemandDepositAccountRequest request);

  /**
   * 계좌 이체
   * 
   * @return
   */
  UpdateDemandDepositAccountTransferResponse updateDemandDepositAccountTransfer(
      UpdateDemandDepositAccountTransferRequest request);

  /**
   * 계좌 거래 내역 조회
   * 
   * @return
   */
  InquireTransactionHistoryListResponse inquireTransactionHistoryList(InquireTransactionHistoryListRequest request);

  /**
   * 계좌 거래 내역 조회(단건)
   * 
   * @return
   */
  InquireTransactionHistoryResponse inquireTransactionHistory(InquireTransactionHistoryRequest request);
}
