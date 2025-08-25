package xyz.jinjin99.gongguyoung.backend.domain.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.DemandDepositClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.InquireDemandDepositAccountBalanceRequest;
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
