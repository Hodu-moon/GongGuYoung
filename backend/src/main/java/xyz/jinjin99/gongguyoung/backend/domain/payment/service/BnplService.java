package xyz.jinjin99.gongguyoung.backend.domain.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.DemandDepositClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.InquireDemandDepositAccountBalanceRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.UpdateDemandDepositAccountTransferRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.InquireDemandDepositAccountBalanceResponse;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchase;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;
import xyz.jinjin99.gongguyoung.backend.domain.member.service.MemberService;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.response.BNPLRemainResponse;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.response.ProcessingBnplResponse;
import xyz.jinjin99.gongguyoung.backend.domain.payment.entity.PaymentEvent;
import xyz.jinjin99.gongguyoung.backend.domain.payment.repository.PaymentRepository;
import xyz.jinjin99.gongguyoung.backend.domain.product.entity.Product;
import xyz.jinjin99.gongguyoung.backend.global.enums.BnplStatus;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class BnplService {

    private final DemandDepositClient demandDepositClient;
    private final MemberService memberService;
    private final PaymentRepository paymentRepository;

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


    // 무슨 물건인지
    // BnplStatus DONE, Processing, null -> BNPL 아닐 때 null
    // PaymentStatus cancle
    // PaymentType
    // BNPL 안끝났으면 얼마 내야 하는지

    public List<ProcessingBnplResponse> listProcessBnplPayments(Long memberId){

        List<ProcessingBnplResponse> list = listProcessBnplPaymentsV1(memberId);

        return list;
    }

    // BNPL 갚기
    // 자기 starter 에서 돈 빼서 flex로 갚아야함
    // payment bnpl status -> done으로 바꾸는 작업도 필요함
    public void payBnpl(Long paymentId, Long memberId){
        PaymentEvent event = paymentRepository.findById(paymentId).orElseThrow(() -> new RuntimeException("ID 에 해당하는 payment를 찾을 수 없습니다."));

        //요청 사람과, event의 사람이 다르면 에러
        if(!Objects.equals(event.getMember().getId(), memberId)){
            throw new RuntimeException("회원 정보가 다릅니다.");
        }

        if(Objects.isNull(event.getBnplStatus()) || event.getBnplStatus() == BnplStatus.DONE){
            throw new RuntimeException("이미 처리된 작업입니다.");
        }

        int toPay = event.getBnplAmount();
        // starter 계정에 남은 돈 확인
        Member member = memberService.getMember(memberId);
        if(!canPayBNPL(member, toPay)){
            throw new RuntimeException("잔액 계좌가 부족합니다.");
        }

        // starter -> flex 로 돈 입금
        updateDeposit(member.getStarterAccountNo(), member.getFlexAccountNo(), toPay);

        // event의 status 변경
        event.markBnplStatusDONE();
    }


    private void updateDeposit(String starterAccountNo, String flexAccountNo, int transactionBalance){
        demandDepositClient.updateDemandDepositAccountTransfer(UpdateDemandDepositAccountTransferRequest.builder()
                        .withdrawalAccountNo(starterAccountNo)
                        .depositAccountNo(flexAccountNo)
                        .transactionBalance((long)transactionBalance)
                        .depositTransactionSummary("bnpl 갚기")
                        .withdrawalTransactionSummary("bnpl " + transactionBalance + "  갚기 ")
                .build());


    }


    private boolean canPayBNPL(Member member, int toPay){
        InquireDemandDepositAccountBalanceResponse response = demandDepositClient.inquireDemandDepositAccountBalance(
                InquireDemandDepositAccountBalanceRequest.builder()
                        .accountNo(member.getStarterAccountNo())
                        .build()
        );

        InquireDemandDepositAccountBalanceResponse.Record record = response.getRecord();

        Long accountBalance = record.getAccountBalance();



        return accountBalance >= toPay;

    }

    private List<ProcessingBnplResponse> listProcessBnplPaymentsV1(Long memberId){
        List<PaymentEvent> paymentEvents = paymentRepository.findByMemberId(memberId);
        List<ProcessingBnplResponse> lists = new ArrayList<>();


        for( PaymentEvent event : paymentEvents){

            if(Objects.isNull(event.getBnplStatus())){
                continue;
            }

            if(event.getBnplStatus() == BnplStatus.PROCESSING){

                Product product = event.getGroupPurchase().getProduct();

                GroupPurchase groupPurchase = event.getGroupPurchase();
                String title = groupPurchase.getTitle();

                ProcessingBnplResponse response = ProcessingBnplResponse.builder()
                        .BNPLStatus(event.getBnplStatus().toString())
                        .bnplAmount(event.getBnplAmount())
                        .itemImageUrl(product.getImageUrl())
                        .paymentId(event.getId())
                        .itemName(product.getName())
                        .groupPurchaseTitle(title)
                        .build();


                lists.add(response);
            }
        }




        return lists;
    }

}
