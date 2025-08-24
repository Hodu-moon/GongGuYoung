package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchase;
import xyz.jinjin99.gongguyoung.backend.global.enums.GroupPurchaseStatus;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class GroupPurchaseResponse {

    private final Long id;
    private final String title;
    private final String context;
    private final Integer targetCount;
    private final Integer currentCount;
    private final Long viewCount;
    private final GroupPurchaseStatus status;
    private final LocalDateTime endAt;
    private final LocalDateTime createdAt;

    private final Long productId;
    private final String productName;
    private final Long productPrice;
    private final String productImageUrl;
    private final String productDescription;

    public static GroupPurchaseResponse from(GroupPurchase groupPurchase) {
        return GroupPurchaseResponse.builder()
                .id(groupPurchase.getId())
                .title(groupPurchase.getTitle())
                .context(groupPurchase.getContext())
                .targetCount(groupPurchase.getTargetCount())
                .currentCount(groupPurchase.getCurrentCount())
                .viewCount(groupPurchase.getViewCount())
                .status(groupPurchase.getStatus())
                .endAt(groupPurchase.getEndAt())
                .createdAt(groupPurchase.getCreatedAt())
                .productId(groupPurchase.getProduct().getId())
                .productName(groupPurchase.getProduct().getName())
                .productPrice(groupPurchase.getProduct().getPrice())
                .productImageUrl(groupPurchase.getProduct().getImageUrl())
                .productDescription(groupPurchase.getProduct().getDescription())
                .build();
    }
}