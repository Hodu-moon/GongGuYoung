package xyz.jinjin99.gongguyoung.backend.domain.product.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.jinjin99.gongguyoung.backend.domain.product.dto.response.ProductResponse;
import xyz.jinjin99.gongguyoung.backend.domain.product.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductService productService;
    
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(@RequestParam String name) {
        List<ProductResponse> products = productService.searchProductsByName(name);
        return ResponseEntity.ok(products);
    }
}