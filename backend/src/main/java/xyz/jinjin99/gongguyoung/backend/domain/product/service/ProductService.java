package xyz.jinjin99.gongguyoung.backend.domain.product.service;

import xyz.jinjin99.gongguyoung.backend.domain.product.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {
    
    List<ProductResponse> getAllProducts();
    
    ProductResponse getProductById(Long id);
    
    List<ProductResponse> searchProductsByName(String name);
}
