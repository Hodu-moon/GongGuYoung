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
import java.util.UUID;
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

    @Value("${account.starter.type-unique-no}")
    private String starterUniqueNo;

    @Override
    public GroupPurchaseResponse createGroupPurchaseAndRegisterScheduling(CreateGroupPurchaseRequest request) {
        // 그룹 구매 단계
        Product product = productRepository.findById(request.getProductId().longValue())
                .orElseThrow(() -> new ProductNotFoundException(request.getProductId().longValue()));

        String generatedEmail = generateEmailForGroupPurchase();
        String userKey;
        try {
            userKey = Optional.ofNullable(memberClient.createMember(generatedEmail).getUserKey())
                        .orElseThrow(() -> new MemberCreationException("Member creation returned null userKey for email: " + generatedEmail));
        } catch (Exception e) {
            throw new MemberCreationException("Failed to create member with email: " + generatedEmail, e);
        }
        
        try {
            demandDepositClient.createDemandDepositAccount(
                    CreateDemandDepositAccountRequest.builder()
                            .header(Header.builder().userKey(userKey).build())
                            .accountTypeUniqueNo(starterUniqueNo)
                            .build());
        } catch (Exception e) {
            throw new AccountCreationException("Failed to create demand deposit account for userKey: " + userKey, e);
        }

        GroupPurchase groupPurchase = GroupPurchase.builder()
                .product(product)
                .title(request.getTitle())
                .context(request.getContext())
                .targetCount(request.getTargetCount())
                .endAt(request.getEndAt())
                .discountedPrice(request.getDiscountedPrice())
                .userKey(userKey)
                .build();
        GroupPurchase savedGroupPurchase = groupPurchaseRepository.save(groupPurchase);

        // 스케쥴링 단계
        delayedJobService.scheduleGroupPurchaseExpiry(savedGroupPurchase.getId(), request.getEndAt());

        return GroupPurchaseResponse.from(savedGroupPurchase);
    }

    private String generateEmailForGroupPurchase() {
        return "grouppurchase-" + UUID.randomUUID().toString().substring(0, 8) + "@gongguyoung.jinjin99.xyz";
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