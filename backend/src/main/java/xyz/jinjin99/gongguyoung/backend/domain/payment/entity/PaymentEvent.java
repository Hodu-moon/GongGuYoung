package xyz.jinjin99.gongguyoung.backend.domain.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchase;
import xyz.jinjin99.gongguyoung.backend.global.enums.BnplStatus;
import xyz.jinjin99.gongguyoung.backend.global.enums.PaymentMethod;
import xyz.jinjin99.gongguyoung.backend.global.enums.PaymentStatus;
import xyz.jinjin99.gongguyoung.backend.global.enums.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PaymentEvent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_purchase_id", nullable = false)
    private GroupPurchase groupPurchase;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Comment("결제 유형(일반/BNPL/혼합)")
    private PaymentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Comment("거래 상태")
    private PaymentStatus status = PaymentStatus.PAID;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Comment("BNPL 상태(BNPL 사용시에만 설정)")
    private BnplStatus bnplStatus; // BNPL 아닐 땐 null

    @Column
    @Comment("일반(즉시) 결제 금액 - 혼합결제일 때만 값 존재")
    private int immediateAmount;

    @Column
    @Comment("BNPL 결제 금액 - BNPL 또는 혼합일 때 값 존재")
    private int bnplAmount;

    @Column(nullable = false)
    private int amount;

    @Column(length = 100)
    @Comment("BNPL 트랜잭션 번호")
    private String bnplTransactionNo;

    @Column(length = 100)
    @Comment("일반(즉시) 결제 트랜잭션 번호")
    private String immediateTransactionNo;

    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;


    // Jpa 를 통해 save, update 하기 전에 유효성 검사 하는 로직
    @PrePersist @PreUpdate
    private void validate() {
        long i = this.immediateAmount;
        long b = this.bnplAmount;
        if (this.amount != i + b) {
            throw new IllegalStateException("amount must equal instantAmount + bnplAmount");
        }
        switch (this.type) {
            case IMMEDIATE_ONLY -> {
                if (b != 0) throw new IllegalStateException("GENERAL -> bnplAmount must be 0");
                if (bnplTransactionNo != null) throw new IllegalStateException("GENERAL -> bnplTransactionNo must be null");
            }
            case BNPL_ONLY -> {
                if (i != 0) throw new IllegalStateException("BNPL_ONLY -> instantAmount must be 0");
                if (bnplTransactionNo == null) throw new IllegalStateException("BNPL_ONLY -> bnplTransactionNo required");
            }
            case SPLIT -> {
                if (i <= 0 || b <= 0) throw new IllegalStateException("SPLIT -> both amounts must be > 0");
                if (immediateTransactionNo == null || bnplTransactionNo == null)
                    throw new IllegalStateException("SPLIT -> both txNos required");
            }
        }
    }


}