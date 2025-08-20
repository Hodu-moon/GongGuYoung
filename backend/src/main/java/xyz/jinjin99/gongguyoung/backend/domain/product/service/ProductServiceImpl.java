package xyz.jinjin99.gongguyoung.backend.domain.product.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import xyz.jinjin99.gongguyoung.backend.domain.product.dto.response.ProductResponse;
import xyz.jinjin99.gongguyoung.backend.domain.product.repository.ProductRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    
    private final ProductRepository productRepository;
    
    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
    }
    
    @Override
    public ProductResponse getProductById(Long id) {
        return productRepository.findById(id)
                .map(ProductResponse::from)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }
    
    @Override
    public List<ProductResponse> searchProductsByName(String name) {
        return productRepository.findByNameContaining(name)
                .stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
    }
}