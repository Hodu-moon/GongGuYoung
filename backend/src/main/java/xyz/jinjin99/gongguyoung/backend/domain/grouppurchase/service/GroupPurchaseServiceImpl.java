package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.service;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.request.CreateGroupPurchaseRequest;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.response.GroupPurchaseResponse;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchase;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.repository.GroupPurchaseRepository;
import xyz.jinjin99.gongguyoung.backend.domain.product.entity.Product;
import xyz.jinjin99.gongguyoung.backend.domain.product.repository.ProductRepository;
import xyz.jinjin99.gongguyoung.backend.global.exception.ProductNotFoundException;
import xyz.jinjin99.gongguyoung.backend.global.exception.GroupPurchaseNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GroupPurchaseServiceImpl implements GroupPurchaseService {

    private final GroupPurchaseRepository groupPurchaseRepository;
    private final ProductRepository productRepository;
    private final DelayedJobService delayedJobService;
    private final AccountService accountService;

    @Override
    public GroupPurchaseResponse createGroupPurchaseAndRegisterScheduling(CreateGroupPurchaseRequest request) {
        // 그룹 구매 단계
        Product product = productRepository.findById(request.getProductId().longValue())
                .orElseThrow(() -> new ProductNotFoundException(request.getProductId().longValue()));

        String accountNo = accountService.createGroupPurchaseAccount();

        GroupPurchase groupPurchase = GroupPurchase.builder()
                .product(product)
                .title(request.getTitle())
                .context(request.getContext())
                .targetCount(request.getTargetCount())
                .endAt(request.getEndAt())
                .discountedPrice(request.getDiscountedPrice())
                .accountNo(accountNo)
                .build();

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

    @Override
    @Transactional(readOnly = true)
    public List<GroupPurchaseResponse> getAllGroupPurchasesByMemberId(Long memberId) {
        return groupPurchaseRepository.findByMemberId(memberId).stream()
                .map(GroupPurchaseResponse::from)
                .collect(Collectors.toList());
    }
}