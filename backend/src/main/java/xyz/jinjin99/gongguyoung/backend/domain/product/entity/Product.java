package xyz.jinjin99.gongguyoung.backend.domain.product.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import org.hibernate.annotations.CurrentTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


@Entity
@Table(name = "product")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private Long price;
    
    @Column(nullable = false)
    private String imageUrl;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    @CurrentTimestamp
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}