package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.*;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.*;

/**
 * 수시입출금 관련 API 호출 클라이언트
 */
public interface DemandDepositClient {
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
  InquireDemandDepositAccountListResponse inquireDemandDepositAccountList(InquireDemandDepositAccountListRequest request);

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
  UpdateDemandDepositAccountTransferResponse updateDemandDepositAccountTransfer(UpdateDemandDepositAccountTransferRequest request);

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
