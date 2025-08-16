package xyz.jinjin99.gongguyoung.backend.domain.member.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bnpl_limit")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BnplLimit {
    
    @Id
    private Long memberId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "member_id")
    private Member member;
    
    @Column(nullable = false)
    private Long limitAmount;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(nullable = false)
    private Long currentUsage;
    
    public BnplLimit(Member member, Long limitAmount, Long currentUsage) {
        this.member = member;
        this.limitAmount = limitAmount;
        this.currentUsage = currentUsage;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updateLimitAmount(Long limitAmount) {
        this.limitAmount = limitAmount;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updateCurrentUsage(Long currentUsage) {
        this.currentUsage = currentUsage;
        this.updatedAt = LocalDateTime.now();
    }
}