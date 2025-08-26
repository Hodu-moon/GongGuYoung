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
    // TODO 테스트를 위해 잠시 풀어둠
    private GroupPurchase groupPurchase;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Comment("결제 유형(일반/BNPL혼합)")
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
    @Comment("수량 몇개 구입할건지 ")
    private int count;

    @Column
    @Comment("BNPL 결제 금액 - BNPL 또는 혼합일 때 값 존재")
    private int bnplAmount;

    @Column(nullable = false)
    @Comment("거래 개수 ")
    private int amount;

    @Column(length = 50)
    @Comment("BNPL 출금 트랜젝션 Unique No")
    private Long bnplWithdrawalTransactionNo;

    @Column(length = 50)
    @Comment("일반(즉시) 출금 트랜젝션 Unique No")
    private Long immediateWithdrawalTransactionNo;



    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;


    // Jpa 를 통해 save, update 하기 전에 유효성 검사 하는 로직
    @PrePersist
    private void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
        validate();
    }
    
    @PreUpdate
    private void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        validate();
    }
    
    private void validate() {
        long i = this.immediateAmount;
        long b = this.bnplAmount;
        if (this.amount != i + b) {
            throw new IllegalStateException("amount must equal instantAmount + bnplAmount");
        }
    }

    public void markBnplStatusDONE(){
        bnplStatus = BnplStatus.DONE;
    }

    public void markRefund(){
        status = PaymentStatus.REFUNDED;
    }


}