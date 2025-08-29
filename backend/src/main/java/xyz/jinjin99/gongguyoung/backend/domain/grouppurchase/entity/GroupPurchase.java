package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import xyz.jinjin99.gongguyoung.backend.domain.product.entity.Product;
import xyz.jinjin99.gongguyoung.backend.global.enums.GroupPurchaseStatus;

import java.time.LocalDateTime;

import org.hibernate.annotations.CurrentTimestamp;

@Entity
@Table(name = "group_purchase")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class GroupPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String context;

    @Column(nullable = false)
    private Long discountedPrice;

    @Column(nullable = false)
    private Integer targetCount; // 목표치 

    @Builder.Default
    @Column(nullable = false)
    private Integer currentCount = 0; // 현재 수량 

    @Column(nullable = false)
    private String accountNo;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long viewCount = 0L;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupPurchaseStatus status = GroupPurchaseStatus.WAITING;

    @Column(nullable = false)
    private LocalDateTime endAt;

    @Column(nullable = false)
    @CurrentTimestamp
    private LocalDateTime createdAt;


    public void increaseCurrentCount() {
        addCurrentCount(1);
    }

    public void decreaseCurrentCount() {
        if (this.currentCount > 0) {
            addCurrentCount(-1);
        }
    }

    public void addCurrentCount(int value) {
        this.currentCount += value;
    }

    public void cancel() {
        this.status = GroupPurchaseStatus.CANCELLED;
    }

    public void complete() {
        this.status = GroupPurchaseStatus.COMPLETE;
    }

    public void increaseViewCount() {
        this.viewCount++;
    }

    public boolean isTargetAchieved() {
        return this.currentCount >= this.targetCount;
    }

    public void processExpiry() {
        if (!isTargetAchieved()) {
            this.status = GroupPurchaseStatus.CANCELLED;
        } else {
            this.status = GroupPurchaseStatus.COMPLETE;
        }
    }
}