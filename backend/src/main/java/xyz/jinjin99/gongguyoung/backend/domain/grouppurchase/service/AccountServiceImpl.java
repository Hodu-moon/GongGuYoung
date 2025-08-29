package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.DemandDepositClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.MemberClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.CreateDemandDepositAccountRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.BaseRequest.Header;
import xyz.jinjin99.gongguyoung.backend.global.exception.AccountCreationException;
import xyz.jinjin99.gongguyoung.backend.global.exception.MemberCreationException;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final DemandDepositClient demandDepositClient;
    private final MemberClient memberClient;

    private static final String GROUP_PURCHASE_EMAIL = "gongguyoung@jinjin99.xyz";

    @Value("${account.starter.type-unique-no}")
    private String starterUniqueNo;

    @Override
    public String createGroupPurchaseAccount() {
        String userKey = createOrGetGroupPurchaseUserKey();
        return createDemandDepositAccount(userKey);
    }

    private String createOrGetGroupPurchaseUserKey() {
        try {
            return Optional.ofNullable(memberClient.getOrCreateMember(GROUP_PURCHASE_EMAIL).getUserKey())
                    .orElseThrow(() -> new MemberCreationException(
                            "Member creation returned null userKey for group purchase email: " + GROUP_PURCHASE_EMAIL));
        } catch (Exception e) {
            throw new MemberCreationException("Failed to create group purchase member with email: " + GROUP_PURCHASE_EMAIL, e);
        }
    }

    private String createDemandDepositAccount(String userKey) {
        try {
            var res = demandDepositClient.createDemandDepositAccount(
                    CreateDemandDepositAccountRequest.builder()
                            .header(Header.builder().userKey(userKey).build())
                            .accountTypeUniqueNo(starterUniqueNo)
                            .build());

            if (res == null || res.getRecord() == null || res.getRecord().getAccountNo() == null) {
                throw new AccountCreationException("Account creation returned null response for group purchase");
            }

            return res.getRecord().getAccountNo();
        } catch (Exception e) {
            throw new AccountCreationException("Failed to create demand deposit account for group purchase", e);
        }
    }
}