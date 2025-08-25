package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "공동구매 응답")
public class GroupPurchaseResponse {

    @Schema(description = "공동구매 ID", example = "1")
    private final Long id;
    
    @Schema(description = "공동구매 제목", example = "아이폰15 공동구매")
    private final String title;
    
    @Schema(description = "공동구매 글 내용", example = "최신 아이폰을 저렴하게 구매해요!")
    private final String context;
    
    @Schema(description = "목표 구매 갯수", example = "10")
    private final Integer targetCount;
    
    @Schema(description = "현재 구매 갯수", example = "7")
    private final Integer currentCount;
    
    @Schema(description = "조회수", example = "150")
    private final Long viewCount;
    
    @Schema(description = "공동구매 상태", example = "WAITING")
    private final GroupPurchaseStatus status;
    
    @Schema(description = "공동구매 종료 시간", example = "2024-12-31T23:59:59")
    private final LocalDateTime endAt;
    
    @Schema(description = "공동구매 생성 시간", example = "2024-01-15T10:30:00")
    private final LocalDateTime createdAt;

    @Schema(description = "상품 ID", example = "1")
    private final Long productId;
    
    @Schema(description = "상품명", example = "iPhone 15 Pro")
    private final String productName;
    
    @Schema(description = "상품 정가 (원 단위)", example = "1500000")
    private final Long productPrice;
    
    @Schema(description = "상품 이미지 URL", example = "https://example.com/iphone15.jpg")
    private final String productImageUrl;
    
    @Schema(description = "상품 설명", example = "최신 A17 Pro 칩셋을 탑재한 프리미엄 스마트폰")
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