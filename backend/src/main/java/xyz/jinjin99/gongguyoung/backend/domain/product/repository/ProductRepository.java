package xyz.jinjin99.gongguyoung.backend.domain.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.jinjin99.gongguyoung.backend.domain.product.entity.Product;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {    
    List<Product> findByNameContaining(String name);
}