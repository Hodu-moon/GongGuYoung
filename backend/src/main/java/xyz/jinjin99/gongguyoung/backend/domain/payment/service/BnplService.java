package xyz.jinjin99.gongguyoung.backend.domain.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.DemandDepositClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.InquireDemandDepositAccountBalanceRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.InquireDemandDepositAccountBalanceResponse;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;
import xyz.jinjin99.gongguyoung.backend.domain.member.service.MemberService;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.response.BNPLRemainResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class BnplService {

    private final DemandDepositClient demandDepositClient;
    private final MemberService memberService;


    public BNPLRemainResponse getBNPLRemain(Long memberId){

        Member member = memberService.getMember(memberId);

        InquireDemandDepositAccountBalanceResponse response = demandDepositClient.inquireDemandDepositAccountBalance(
                InquireDemandDepositAccountBalanceRequest.builder()
                        .accountNo(member.getFlexAccountNo())
                        .build()
        );

        InquireDemandDepositAccountBalanceResponse.Record record = response.getRecord();

        return BNPLRemainResponse.builder()
                .remain(record.getAccountBalance())
                .memberId(memberId)
                .build();
    }
}
