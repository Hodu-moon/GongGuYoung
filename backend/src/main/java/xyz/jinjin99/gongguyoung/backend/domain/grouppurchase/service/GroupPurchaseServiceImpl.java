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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GroupPurchaseServiceImpl implements GroupPurchaseService {
    
    private final GroupPurchaseRepository groupPurchaseRepository;
    private final ProductRepository productRepository;
    private final DelayedJobService delayedJobService;
    
    @Override
    public GroupPurchaseResponse createGroupPurchaseAndRegisterScheduling(CreateGroupPurchaseRequest request) {
        // 그룹 구매 단계
        Product product = productRepository.findById(request.getProductId().longValue())
                .orElseThrow(() -> new ProductNotFoundException(request.getProductId().longValue()));
        
        GroupPurchase groupPurchase = new GroupPurchase(
                product,
                request.getTitle(),
                request.getContext(),
                request.getTargetCount(),
                request.getEndAt(),
                request.getDiscountedPrice()
        );
        
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
}