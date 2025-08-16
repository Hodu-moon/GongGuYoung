package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_purchase_participant")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupPurchaseParticipant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_purchase_id", nullable = false)
    private GroupPurchase groupPurchase;
    
    @Column(nullable = false)
    private Boolean isPaid;
    
    @Column(nullable = false)
    private LocalDateTime joinedAt;
    
    public GroupPurchaseParticipant(Member member, GroupPurchase groupPurchase) {
        this.member = member;
        this.groupPurchase = groupPurchase;
        this.isPaid = false;
        this.joinedAt = LocalDateTime.now();
    }
    
    public void markAsPaid() {
        this.isPaid = true;
    }
}