package xyz.jinjin99.gongguyoung.backend.domain.product.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Entity
@Table(name = "product")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private Long price;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    private String imageUrl;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    public Product(String name, Long price, String category, String imageUrl, String description) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.imageUrl = imageUrl;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updateProduct(String name, Long price, String category, String imageUrl, String description) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.imageUrl = imageUrl;
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }
}