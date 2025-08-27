package xyz.jinjin99.gongguyoung.backend.domain.member.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.DemandDepositClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.ManagerClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.MemberClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.BankAccountRecord;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.MemberRecord;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.*;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.CreateDemandDepositAccountResponse;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.InquireDemandDepositAccountBalanceResponse;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.InquireDemandDepositAccountListResponse;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.UpdateDemandDepositAccountDepositResponse;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.request.SignupRequest;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.response.BNPLLimitUpdateResponse;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.response.MemberAccountsNo;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.response.MemberStarterAccountResponse;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.response.SignupResponse;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;
import xyz.jinjin99.gongguyoung.backend.domain.member.repository.MemberRepository;
import xyz.jinjin99.gongguyoung.backend.global.utils.PasswordUtil;

import java.util.Objects;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final ManagerClient managerClient;
    private final PasswordUtil passwordUtil;
    private final MemberClient memberClient;
    private final DemandDepositClient demandDepositClient;

    @Value("${account.starter.type-unique-no}")
    private String starterUniqueNo;

    @Value("${account.flex.type-unique-no}")
    private String flexUniqueNo;


    // TODO 1. 중복 회원가입 방지
    // 흐름도
    // 1. 회원가입 시도 -> db 에 저장되어있는지 확인
    // 2. 이메일로 api 서버에 회원이 존재하는지 확인
    // 2 - 1.  존재하면 멤버 정보 반환 후 db에 저장
    // 2 - 2. 존재하지 않으면 멤버 생성후, 계좌까지 만들고 저장

    public SignupResponse signupMember(SignupRequest request){

        if(memberRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("member already exists");
        }

        String encodedPassword = passwordUtil.encodeSHA256(request.getPassword());
        String email = request.getEmail();

        MemberRecord memberRecord = memberClient.searchMember(email);
        log.info("searchMember is null : {}", Objects.isNull(memberRecord));
        String starterAccountNo = null, bnplAccountNo = null, userKey = null ;

        // 2. 이메일로 서버에 회원이 존재하는지 확인
        if(Objects.isNull(memberRecord)){
            // 2 - 2 존재 하지 않으면 멤버 생성
            MemberRecord createdMember = memberClient.createMember(email);
            userKey = createdMember.getUserKey();

            // 계좌 생성
            CreateDemandDepositAccountRequest starterAccountRequest = CreateDemandDepositAccountRequest.builder()
                    .accountTypeUniqueNo(starterUniqueNo)
                    .header(BaseRequest.Header.builder()
                            .userKey(userKey)
                            .build())
                    .build();

            CreateDemandDepositAccountResponse demandDepositAccount = demandDepositClient.
                    createDemandDepositAccount(starterAccountRequest);

            starterAccountNo = demandDepositAccount.getRecord().getAccountNo();


            CreateDemandDepositAccountRequest flexAccountRequest = CreateDemandDepositAccountRequest.builder()
                    .header(BaseRequest.Header.builder().userKey(userKey).build())
                    .accountTypeUniqueNo(flexUniqueNo)
                    .build();

            CreateDemandDepositAccountResponse demandDepositAccount1 = demandDepositClient.createDemandDepositAccount(flexAccountRequest);

            bnplAccountNo = demandDepositAccount1.getRecord().getAccountNo();

            // BNPL 계좌에 10만원 추가
            // 일반 계좌에 5만원 추가
            demandDepositClient.updateDemandDepositAccountDeposit(
                    UpdateDemandDepositAccountDepositRequest.builder()
                            .header(BaseRequest.Header.builder().userKey(userKey).build())
                            .accountNo(bnplAccountNo)
                            .transactionBalance(100000L)
                            .transactionSummary("회원가입")
                            .build()
            );

            demandDepositClient.updateDemandDepositAccountDeposit(
                    UpdateDemandDepositAccountDepositRequest.builder()
                            .header(BaseRequest.Header.builder().userKey(userKey).build())
                            .accountNo(starterAccountNo)
                            .transactionBalance(50000L)
                            .transactionSummary("회원가입")
                            .build()
            );

        }else{ // 회원이 존재하면
            userKey = memberRecord.getUserKey();
            // 회원이 존재하면

            InquireDemandDepositAccountListRequest demandRequest = InquireDemandDepositAccountListRequest.builder()
                    .header(BaseRequest.Header.builder()
                            .userKey(userKey)
                            .build())
                    .build();

            InquireDemandDepositAccountListResponse inquireDemandDepositAccountListResponse = demandDepositClient.inquireDemandDepositAccountList(demandRequest);


            for(BankAccountRecord bankAccountRecord : inquireDemandDepositAccountListResponse.getRecords()){
                if(bankAccountRecord.getAccountName().equals("신한 캠퍼스스타트 계좌")){
                    starterAccountNo = bankAccountRecord.getAccountNo();
                }

                if(bankAccountRecord.getAccountName().equals("신한 캠퍼스 플렉스 계좌")){
                    bnplAccountNo = bankAccountRecord.getAccountNo();
                }
            }

        }


        Member member = Member.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(encodedPassword)
                .userKey(userKey)
                .bnplLimit(100000)
                .starterAccountNo(starterAccountNo)
                .flexAccountNo(bnplAccountNo)
                .build();

        Member saved = memberRepository.save(member);

        return SignupResponse.builder()
                .id(saved.getId())
                .email(saved.getEmail())
                .name(saved.getName())
                .userKey(saved.getUserKey())
                .build();
    }

    public Member authenticate(String email, String password){
        Member member = memberRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("here"));


        if(passwordUtil.matches(password, member.getPassword())){
            return member;
        }

        throw new RuntimeException("ID 비밀번호 맞지 않음");
    }

    public MemberAccountsNo getAccountNo(Long memberId){
        Optional<Member> byId = memberRepository.findById(memberId);

        if(byId.isEmpty()){
            throw new RuntimeException("member Not Found Exception");
        }

        Member member = byId.get();

        return MemberAccountsNo.builder()
                .starterAccountNo(member.getStarterAccountNo())
                .flexAccountNo(member.getFlexAccountNo())
                .build();
    }

    public Member getMember(Long id){

        return memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("회원이 존재하지 않습니다."));
    }


    @Transactional
    public MemberStarterAccountResponse  getStarterBalance(Long memberId){
        Member member = getMember(memberId);


        InquireDemandDepositAccountBalanceResponse response = demandDepositClient.inquireDemandDepositAccountBalance(
                InquireDemandDepositAccountBalanceRequest.builder()
                        .header(BaseRequest.Header.builder().userKey(member.getUserKey()).build())
                        .accountNo(member.getStarterAccountNo())
                        .build()
        );

        InquireDemandDepositAccountBalanceResponse.Record record = response.getRecord();
        Long accountBalance = record.getAccountBalance();

        int balance = accountBalance.intValue();

        return MemberStarterAccountResponse.builder()
                .memberId(memberId)
                .starterBalance(balance)
                .build();
    }



    // bnpl limit update 함수

    @Transactional
    public BNPLLimitUpdateResponse updateBnplLimit(Long memberId, int limit){
        Member member = getMember(memberId);

        // 10만원
        int bnplLimit = member.getBnplLimit();

        // 리미트가 5만원으로 내리려고 함
        if(bnplLimit > limit){
            throw new RuntimeException("현재 bnpl 한도보다 업데이트 하려는 한도가 낮습니다.");
        }

//        limit - bnplLimit -> 추가할 값

        member.updateBnplLimit(limit);

        UpdateDemandDepositAccountDepositResponse bnplUpdate = demandDepositClient.updateDemandDepositAccountDeposit(
                UpdateDemandDepositAccountDepositRequest.builder()
                        .header(BaseRequest.Header.builder().userKey(member.getUserKey()).build())
                        .accountNo(member.getFlexAccountNo())
                        .transactionBalance((long) limit - bnplLimit)
                        .transactionSummary("bnpl 한도 업데이트")
                        .build()
        );

        // 이러면


        return BNPLLimitUpdateResponse.builder()
                .previousBnplLimit(bnplLimit)
                .updateBnplLimit(limit)
                .build();

    }


}
