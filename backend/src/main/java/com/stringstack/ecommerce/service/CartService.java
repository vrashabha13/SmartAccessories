package com.stringstack.ecommerce.service;

import com.stringstack.ecommerce.dto.CartItemRequest;
import com.stringstack.ecommerce.dto.CartItemResponse;
import com.stringstack.ecommerce.dto.CartResponse;
import com.stringstack.ecommerce.entity.CartItem;
import com.stringstack.ecommerce.entity.Product;
import com.stringstack.ecommerce.entity.ProductImage;
import com.stringstack.ecommerce.repository.CartItemRepository;
import com.stringstack.ecommerce.repository.ProductImageRepository;
import com.stringstack.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    public CartService(CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       ProductImageRepository productImageRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
    }

    public CartResponse getCartItems(Integer userId) {
        List<CartItemResponse> items = cartItemRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        BigDecimal grandTotal = items.stream()
                .map(CartItemResponse::getLineTotal)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return new CartResponse(items, grandTotal, totalItems);
    }

    public int getCartCount(Integer userId) {
        return cartItemRepository.sumQuantityByUserId(userId);
    }

    @Transactional
    public CartItemResponse addToCart(Integer userId, CartItemRequest request) {
        if (request.getProductId() == null) {
            throw new IllegalArgumentException("Product id is required");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        int quantityToAdd = request.getQuantity() != null && request.getQuantity() > 0
                ? request.getQuantity() : 1;

        CartItem item = cartItemRepository.findByUserIdAndProductId(userId, request.getProductId())
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setUserId(userId);
                    newItem.setProductId(request.getProductId());
                    newItem.setQuantity(0);
                    return newItem;
                });

        int newQuantity = item.getQuantity() + quantityToAdd;

        if (newQuantity > product.getStock()) {
            throw new IllegalStateException("Stock limit exceeded. Only "
                    + product.getStock() + " products are available.");
        }

        item.setQuantity(newQuantity);
        cartItemRepository.save(item);

        return toResponse(item);
    }

    @Transactional
    public CartItemResponse updateCartItemQuantity(Long cartItemId, Integer userId, Integer quantity) {
        if (quantity == null) {
            throw new IllegalArgumentException("Quantity is required");
        }

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        if (quantity == 0) {
            cartItemRepository.delete(item);
            return null;
        }

        Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (quantity > product.getStock()) {
            throw new IllegalStateException("Stock limit exceeded. Only "
                    + product.getStock() + " products are available.");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return toResponse(item);
    }

    @Transactional
    public void removeFromCart(Long cartItemId, Integer userId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(Integer userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    private CartItemResponse toResponse(CartItem item) {
        CartItemResponse response = new CartItemResponse();
        response.setCartItemId(item.getId());
        response.setProductId(item.getProductId());
        response.setQuantity(item.getQuantity());

        Product product = productRepository.findById(item.getProductId()).orElse(null);
        if (product != null) {
            response.setProductName(product.getName());
            response.setDescription(product.getDescription());
            response.setPrice(product.getPrice());
            response.setStock(product.getStock());
            response.setLineTotal(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));

            List<ProductImage> images = productImageRepository.findByProductId(product.getProductId());
            if (!images.isEmpty()) {
                response.setImageUrl(images.get(0).getImageUrl());
            }
        }

        return response;
    }
}
