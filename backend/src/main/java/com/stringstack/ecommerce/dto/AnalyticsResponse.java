package com.stringstack.ecommerce.dto;

import java.math.BigDecimal;
import java.util.List;

public class AnalyticsResponse {

    private BigDecimal totalRevenue;
    private long transactionCount;
    private BigDecimal averageOrderValue;
    private List<TopProduct> topSellingProducts;
    private List<TrendData> salesTrend;
    private List<TransactionDetail> transactions;

    public AnalyticsResponse() {}

    public AnalyticsResponse(BigDecimal totalRevenue, long transactionCount, BigDecimal averageOrderValue,
                             List<TopProduct> topSellingProducts, List<TrendData> salesTrend,
                             List<TransactionDetail> transactions) {
        this.totalRevenue = totalRevenue;
        this.transactionCount = transactionCount;
        this.averageOrderValue = averageOrderValue;
        this.topSellingProducts = topSellingProducts;
        this.salesTrend = salesTrend;
        this.transactions = transactions;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(long transactionCount) {
        this.transactionCount = transactionCount;
    }

    public BigDecimal getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(BigDecimal averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }

    public List<TopProduct> getTopSellingProducts() {
        return topSellingProducts;
    }

    public void setTopSellingProducts(List<TopProduct> topSellingProducts) {
        this.topSellingProducts = topSellingProducts;
    }

    public List<TrendData> getSalesTrend() {
        return salesTrend;
    }

    public void setSalesTrend(List<TrendData> salesTrend) {
        this.salesTrend = salesTrend;
    }

    public List<TransactionDetail> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<TransactionDetail> transactions) {
        this.transactions = transactions;
    }

    public static class TopProduct {
        private String name;
        private int quantitySold;
        private BigDecimal revenue;

        public TopProduct() {}

        public TopProduct(String name, int quantitySold, BigDecimal revenue) {
            this.name = name;
            this.quantitySold = quantitySold;
            this.revenue = revenue;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public int getQuantitySold() {
            return quantitySold;
        }

        public void setQuantitySold(int quantitySold) {
            this.quantitySold = quantitySold;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }
    }

    public static class TrendData {
        private String label;
        private BigDecimal revenue;

        public TrendData() {}

        public TrendData(String label, BigDecimal revenue) {
            this.label = label;
            this.revenue = revenue;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }
    }

    public static class TransactionDetail {
        private String orderId;
        private String username;
        private BigDecimal totalAmount;
        private String date;
        private String status;

        public TransactionDetail() {}

        public TransactionDetail(String orderId, String username, BigDecimal totalAmount, String date, String status) {
            this.orderId = orderId;
            this.username = username;
            this.totalAmount = totalAmount;
            this.date = date;
            this.status = status;
        }

        public String getOrderId() {
            return orderId;
        }

        public void setOrderId(String orderId) {
            this.orderId = orderId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
