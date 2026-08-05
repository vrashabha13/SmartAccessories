package com.stringstack.ecommerce.repository;

import com.stringstack.ecommerce.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    List<OrderItem> findByOrderId(String orderId);
    boolean existsByProductId(Integer productId);
}
