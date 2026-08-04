package com.stringstack.ecommerce.service;

import com.stringstack.ecommerce.dto.OrderProductDTO;
import com.stringstack.ecommerce.dto.OrdersResponse;
import com.stringstack.ecommerce.entity.*;
import com.stringstack.ecommerce.repository.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        ProductRepository productRepository,
                        ProductImageRepository productImageRepository,
                        CategoryRepository categoryRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public OrdersResponse getOrderHistory(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Order> orders = orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, Order.Status.SUCCESS);

        List<OrderProductDTO> productsList = new ArrayList<>();

        for (Order order : orders) {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
            for (OrderItem item : items) {
                Product product = productRepository.findById(item.getProductId()).orElse(null);
                if (product == null) {
                    continue;
                }

                OrderProductDTO dto = new OrderProductDTO();
                dto.setOrderId(order.getOrderId());
                dto.setProductId(product.getProductId());
                dto.setProductName(product.getName());
                dto.setProductDescription(product.getDescription());

                // Find image url
                List<ProductImage> images = productImageRepository.findByProductId(product.getProductId());
                if (images != null && !images.isEmpty()) {
                    dto.setProductImage(images.get(0).getImageUrl());
                } else {
                    dto.setProductImage("/placeholder.png");
                }

                // Find category name
                if (product.getCategoryId() != null) {
                    Category category = categoryRepository.findById(product.getCategoryId()).orElse(null);
                    if (category != null) {
                        dto.setCategory(category.getCategoryName());
                    }
                }

                dto.setQuantityPurchased(item.getQuantity());
                dto.setPricePerUnit(item.getPricePerUnit());
                dto.setTotalPrice(item.getTotalPrice());
                dto.setOrderStatus(order.getStatus().name());
                dto.setOrderDate(order.getCreatedAt().toString());

                productsList.add(dto);
            }
        }

        return new OrdersResponse(user.getRole().name(), productsList, user.getUsername());
    }
}
