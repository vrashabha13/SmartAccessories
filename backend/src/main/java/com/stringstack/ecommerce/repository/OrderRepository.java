package com.stringstack.ecommerce.repository;

import com.stringstack.ecommerce.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByUserIdAndStatusOrderByCreatedAtDesc(Integer userId, Order.Status status);
    List<Order> findByStatus(Order.Status status);
    List<Order> findByStatusAndCreatedAtBetween(Order.Status status, java.time.LocalDateTime start, java.time.LocalDateTime end);
    boolean existsByUserId(Integer userId);
}
