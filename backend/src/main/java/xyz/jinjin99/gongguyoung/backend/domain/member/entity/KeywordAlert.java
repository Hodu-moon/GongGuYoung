package xyz.jinjin99.gongguyoung.backend.domain.member.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "keyword_alert")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class KeywordAlert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
    
    @Column(nullable = false)
    private String keyword;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    public KeywordAlert(Member member, String keyword) {
        this.member = member;
        this.keyword = keyword;
        this.createdAt = LocalDateTime.now();
    }
}