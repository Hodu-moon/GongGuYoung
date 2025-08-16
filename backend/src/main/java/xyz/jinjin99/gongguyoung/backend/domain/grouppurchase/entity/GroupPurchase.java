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
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private Integer targetCount;
    
    @Column(nullable = false)
    private Integer currentCount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupPurchaseStatus status;
    
    @OneToOne(mappedBy = "groupPurchase", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private GroupPurchaseAccount groupPurchaseAccount;
    
    @OneToMany(mappedBy = "groupPurchase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupPurchaseParticipant> participants = new ArrayList<>();
    
    public GroupPurchase(Product product, Integer targetCount) {
        this.product = product;
        this.targetCount = targetCount;
        this.currentCount = 0;
        this.status = GroupPurchaseStatus.WAITING;
        this.createdAt = LocalDateTime.now();
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