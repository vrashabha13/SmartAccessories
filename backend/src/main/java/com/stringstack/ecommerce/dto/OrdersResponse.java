package com.stringstack.ecommerce.dto;

import java.util.List;

public class OrdersResponse {
    private String role;
    private OrdersContainer orders;
    private String username;

    public OrdersResponse() {
    }

    public OrdersResponse(String role, List<OrderProductDTO> products, String username) {
        this.role = role;
        this.orders = new OrdersContainer(products);
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public OrdersContainer getOrders() {
        return orders;
    }

    public void setOrders(OrdersContainer orders) {
        this.orders = orders;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public static class OrdersContainer {
        private List<OrderProductDTO> products;

        public OrdersContainer() {
        }

        public OrdersContainer(List<OrderProductDTO> products) {
            this.products = products;
        }

        public List<OrderProductDTO> getProducts() {
            return products;
        }

        public void setProducts(List<OrderProductDTO> products) {
            this.products = products;
        }
    }
}
