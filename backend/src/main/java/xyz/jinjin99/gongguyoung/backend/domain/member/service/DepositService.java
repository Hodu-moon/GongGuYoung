package xyz.jinjin99.gongguyoung.backend.domain.member.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.DemandDepositClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.BaseRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.InquireDemandDepositAccountBalanceRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.UpdateDemandDepositAccountDepositRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.InquireDemandDepositAccountBalanceResponse;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.response.DepositResponse;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepositService {

    private final DemandDepositClient demandDepositClient;
    private final MemberService memberService;

    public DepositResponse deposit(Long memberId, Long amount){
        Member member = memberService.getMember(memberId);

        demandDepositClient.updateDemandDepositAccountDeposit(
                UpdateDemandDepositAccountDepositRequest.builder()
                        .header(BaseRequest.Header.builder().userKey(member.getUserKey()).build())
                        .accountNo(member.getStarterAccountNo())
                        .transactionBalance(amount)
                        .transactionSummary("통장에 입금")
                        .build()

        );


        InquireDemandDepositAccountBalanceResponse inquireDemandDepositAccountBalanceResponse = demandDepositClient.inquireDemandDepositAccountBalance(
                InquireDemandDepositAccountBalanceRequest.builder()
                        .header(BaseRequest.Header.builder().userKey(member.getUserKey()).build())
                        .accountNo(member.getStarterAccountNo())
                        .build()
        );

        return DepositResponse.builder()
                .accountBalance(inquireDemandDepositAccountBalanceResponse.getRecord().getAccountBalance())
                .amount(amount)
                .createdAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .build();

    }

}
