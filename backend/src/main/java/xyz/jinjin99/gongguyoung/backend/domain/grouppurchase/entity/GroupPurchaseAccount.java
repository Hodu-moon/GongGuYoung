package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_purchase_account")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupPurchaseAccount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_purchase_id", nullable = false)
    private GroupPurchase groupPurchase;
    
    @Column(nullable = false)
    private String bankName;
    
    @Column(nullable = false)
    private String accountNumber;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    public GroupPurchaseAccount(GroupPurchase groupPurchase, String bankName, String accountNumber) {
        this.groupPurchase = groupPurchase;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.createdAt = LocalDateTime.now();
    }
}