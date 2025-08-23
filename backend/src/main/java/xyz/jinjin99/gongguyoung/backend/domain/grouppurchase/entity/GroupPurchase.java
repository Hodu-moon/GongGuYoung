package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import xyz.jinjin99.gongguyoung.backend.domain.product.entity.Product;
import xyz.jinjin99.gongguyoung.backend.global.enums.GroupPurchaseStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CurrentTimestamp;

@Entity
@Table(name = "group_purchase")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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
    private Integer targetCount;

    @Column(nullable = false)
    private Integer currentCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupPurchaseStatus status;

    @Column(nullable = false)
    private LocalDateTime endAt;

    @Column(nullable = false)
    @CurrentTimestamp
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "groupPurchase", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private GroupPurchaseAccount groupPurchaseAccount;

    @OneToMany(mappedBy = "groupPurchase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupPurchaseParticipant> participants = new ArrayList<>();

    public GroupPurchase(Product product, String title, String context, Integer targetCount, LocalDateTime endAt, Long discountedPrice) {
        this.product = product;
        this.targetCount = targetCount;
        this.context = context;
        this.title = title;
        this.endAt = endAt;
        this.currentCount = 0;
        this.discountedPrice = discountedPrice;
        this.status = GroupPurchaseStatus.WAITING;
    }

    public void increaseCurrentCount() {
        this.currentCount++;
        if (this.currentCount >= this.targetCount) {
            this.status = GroupPurchaseStatus.COMPLETE;
        }
    }

    public void decreaseCurrentCount() {
        if (this.currentCount > 0) {
            this.currentCount--;
            if (this.status == GroupPurchaseStatus.COMPLETE) {
                this.status = GroupPurchaseStatus.WAITING;
            }
        }
    }

    public void cancel() {
        this.status = GroupPurchaseStatus.CANCELLED;
    }
}