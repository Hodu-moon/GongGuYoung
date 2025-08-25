package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.service;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import xyz.jinjin99.gongguyoung.backend.client.finopen.client.DemandDepositClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.MemberClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.CreateDemandDepositAccountRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.BaseRequest.Header;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.request.CreateGroupPurchaseRequest;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.response.GroupPurchaseResponse;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchase;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.repository.GroupPurchaseRepository;
import xyz.jinjin99.gongguyoung.backend.domain.product.entity.Product;
import xyz.jinjin99.gongguyoung.backend.domain.product.repository.ProductRepository;
import xyz.jinjin99.gongguyoung.backend.global.exception.ProductNotFoundException;
import xyz.jinjin99.gongguyoung.backend.global.exception.GroupPurchaseNotFoundException;
import xyz.jinjin99.gongguyoung.backend.global.exception.MemberCreationException;
import xyz.jinjin99.gongguyoung.backend.global.exception.AccountCreationException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GroupPurchaseServiceImpl implements GroupPurchaseService {

    private final GroupPurchaseRepository groupPurchaseRepository;
    private final ProductRepository productRepository;
    private final DelayedJobService delayedJobService;

    private final DemandDepositClient demandDepositClient;
    private final MemberClient memberClient;

    private final String GROUP_PURCHASE_EMAIL = "gongguyoung@jinjin99.xyz";

    @Value("${account.starter.type-unique-no}")
    private String starterUniqueNo;

    @Override
    public GroupPurchaseResponse createGroupPurchaseAndRegisterScheduling(CreateGroupPurchaseRequest request) {
        // 그룹 구매 단계
        Product product = productRepository.findById(request.getProductId().longValue())
                .orElseThrow(() -> new ProductNotFoundException(request.getProductId().longValue()));

        String userKey;
        try {
            userKey = Optional.ofNullable(memberClient.getOrCreateMember(GROUP_PURCHASE_EMAIL).getUserKey())
                    .orElseThrow(() -> new MemberCreationException(
                            "Member creation returned null userKey for email: " + GROUP_PURCHASE_EMAIL));
        } catch (Exception e) {
            throw new MemberCreationException("Failed to create member with email: " + GROUP_PURCHASE_EMAIL, e);
        }

        GroupPurchase groupPurchase;
        try {
            var res = demandDepositClient.createDemandDepositAccount(
                    CreateDemandDepositAccountRequest.builder()
                            .header(Header.builder().userKey(userKey).build())
                            .accountTypeUniqueNo(starterUniqueNo)
                            .build());

            if (res == null || res.getRecord() == null || res.getRecord().getAccountNo() == null) {
                throw new AccountCreationException("Account creation returned null response for email: " + GROUP_PURCHASE_EMAIL);
            }

            groupPurchase = GroupPurchase.builder()
                    .product(product)
                    .title(request.getTitle())
                    .context(request.getContext())
                    .targetCount(request.getTargetCount())
                    .endAt(request.getEndAt())
                    .discountedPrice(request.getDiscountedPrice())
                    .accountNo(res.getRecord().getAccountNo())
                    .build();
        } catch (Exception e) {
            throw new AccountCreationException("Failed to create demand deposit account for email: " + GROUP_PURCHASE_EMAIL, e);
        }

        GroupPurchase savedGroupPurchase = groupPurchaseRepository.save(groupPurchase);

        // 스케쥴링 단계
        delayedJobService.scheduleGroupPurchaseExpiry(savedGroupPurchase.getId(), request.getEndAt());

        return GroupPurchaseResponse.from(savedGroupPurchase);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupPurchaseResponse> getAllGroupPurchases() {
        return groupPurchaseRepository.findAll()
                .stream()
                .map(GroupPurchaseResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GroupPurchaseResponse getGroupPurchaseById(Long id) {
        GroupPurchase groupPurchase = groupPurchaseRepository.findById(id)
                .orElseThrow(() -> new GroupPurchaseNotFoundException(id));

        return GroupPurchaseResponse.from(groupPurchase);
    }

    @Override
    public GroupPurchaseResponse getGroupPurchaseByIdWithViewCount(Long id) {
        GroupPurchase groupPurchase = groupPurchaseRepository.findById(id)
                .orElseThrow(() -> new GroupPurchaseNotFoundException(id));

        groupPurchase.increaseViewCount();
        groupPurchaseRepository.save(groupPurchase);

        return GroupPurchaseResponse.from(groupPurchase);
    }
}