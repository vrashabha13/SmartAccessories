package com.stringstack.ecommerce.service;

import com.stringstack.ecommerce.dto.CategoryDTO;
import com.stringstack.ecommerce.dto.ProductDTO;
import com.stringstack.ecommerce.entity.Category;
import com.stringstack.ecommerce.entity.Product;
import com.stringstack.ecommerce.entity.ProductImage;
import com.stringstack.ecommerce.repository.CategoryRepository;
import com.stringstack.ecommerce.repository.ProductImageRepository;
import com.stringstack.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    public ProductService(CategoryRepository categoryRepository,
                          ProductRepository productRepository,
                          ProductImageRepository productImageRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> new CategoryDTO(cat.getCategoryId(), cat.getCategoryName()))
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getProductsByCategory(Integer categoryId) {
        List<Product> products = productRepository.findByCategoryId(categoryId);
        return products.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ProductDTO getProductById(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return toDTO(product);
    }

    private ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setProductId(product.getProductId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setCategoryId(product.getCategoryId());

        List<ProductImage> images = productImageRepository.findByProductId(product.getProductId());
        if (!images.isEmpty()) {
            dto.setImageUrl(images.get(0).getImageUrl());
        }

        return dto;
    }
}
