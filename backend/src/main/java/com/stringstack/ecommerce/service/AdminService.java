package com.stringstack.ecommerce.service;

import com.stringstack.ecommerce.dto.AnalyticsResponse;
import com.stringstack.ecommerce.dto.ProductDTO;
import com.stringstack.ecommerce.entity.*;
import com.stringstack.ecommerce.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final JwtTokenRepository jwtTokenRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(ProductRepository productRepository,
                        ProductImageRepository productImageRepository,
                        CategoryRepository categoryRepository,
                        UserRepository userRepository,
                        CartItemRepository cartItemRepository,
                        OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        JwtTokenRepository jwtTokenRepository,
                        PasswordEncoder passwordEncoder) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.jwtTokenRepository = jwtTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // --- Product Management ---

    @Transactional
    public ProductDTO addProduct(ProductDTO dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("Product name is required");
        }
        if (dto.getPrice() == null || dto.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Product price must be non-negative");
        }
        if (dto.getStock() == null || dto.getStock() < 0) {
            throw new IllegalArgumentException("Product stock must be non-negative");
        }
        if (dto.getCategoryId() == null) {
            throw new IllegalArgumentException("Product category ID is required");
        }

        // Validate Category
        if (!categoryRepository.existsById(dto.getCategoryId())) {
            throw new IllegalArgumentException("Invalid product category ID");
        }

        // Validate Duplication
        if (productRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new IllegalArgumentException("Product with name '" + dto.getName() + "' already exists");
        }

        Product product = new Product();
        product.setName(dto.getName().trim());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setCategoryId(dto.getCategoryId());

        Product savedProduct = productRepository.save(product);

        if (dto.getImageUrl() != null && !dto.getImageUrl().isBlank()) {
            ProductImage productImage = new ProductImage();
            productImage.setProductId(savedProduct.getProductId());
            productImage.setImageUrl(dto.getImageUrl().trim());
            productImageRepository.save(productImage);
        }

        ProductDTO result = new ProductDTO();
        result.setProductId(savedProduct.getProductId());
        result.setName(savedProduct.getName());
        result.setDescription(savedProduct.getDescription());
        result.setPrice(savedProduct.getPrice());
        result.setStock(savedProduct.getStock());
        result.setCategoryId(savedProduct.getCategoryId());
        result.setImageUrl(dto.getImageUrl());

        return result;
    }

    @Transactional
    public void deleteProduct(Integer productId) {
        if (!productRepository.existsById(productId)) {
            throw new IllegalArgumentException("Product not found");
        }

        // Check for order history
        if (orderItemRepository.existsByProductId(productId)) {
            throw new IllegalArgumentException("Cannot delete product because it has associated orders/transactions. Consider setting its stock to 0 instead.");
        }

        // Delete associated cart items
        cartItemRepository.deleteByProductId(productId);

        // Delete product images
        productImageRepository.deleteByProductId(productId);

        // Delete product
        productRepository.deleteById(productId);
    }

    @Transactional
    public ProductDTO updateProduct(Integer productId, ProductDTO dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("Product name is required");
        }
        if (dto.getPrice() == null || dto.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Product price must be non-negative");
        }
        if (dto.getStock() == null || dto.getStock() < 0) {
            throw new IllegalArgumentException("Product stock must be non-negative");
        }
        if (dto.getCategoryId() == null) {
            throw new IllegalArgumentException("Product category ID is required");
        }

        // Validate Category
        if (!categoryRepository.existsById(dto.getCategoryId())) {
            throw new IllegalArgumentException("Invalid product category ID");
        }

        // Validate Name Duplication (excluding this product ID)
        if (productRepository.findByNameIgnoreCaseAndProductIdNot(dto.getName().trim(), productId).isPresent()) {
            throw new IllegalArgumentException("Another product with the name '" + dto.getName() + "' already exists");
        }

        product.setName(dto.getName().trim());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setCategoryId(dto.getCategoryId());

        Product savedProduct = productRepository.save(product);

        // Update product image
        List<ProductImage> images = productImageRepository.findByProductId(productId);
        String finalImageUrl = (dto.getImageUrl() != null) ? dto.getImageUrl().trim() : "";
        if (!finalImageUrl.isBlank()) {
            if (!images.isEmpty()) {
                ProductImage productImage = images.get(0);
                productImage.setImageUrl(finalImageUrl);
                productImageRepository.save(productImage);
            } else {
                ProductImage productImage = new ProductImage();
                productImage.setProductId(productId);
                productImage.setImageUrl(finalImageUrl);
                productImageRepository.save(productImage);
            }
        }

        ProductDTO result = new ProductDTO();
        result.setProductId(savedProduct.getProductId());
        result.setName(savedProduct.getName());
        result.setDescription(savedProduct.getDescription());
        result.setPrice(savedProduct.getPrice());
        result.setStock(savedProduct.getStock());
        result.setCategoryId(savedProduct.getCategoryId());
        result.setImageUrl(finalImageUrl);

        return result;
    }

    // --- User Management ---

    public List<User> getAllUsers() {
        return userRepository.findAll().stream()
                .peek(u -> u.setPassword(null)) // Hide password hashes
                .collect(Collectors.toList());
    }

    @Transactional
    public User updateUser(Integer userId, User updateDetails) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (updateDetails.getUsername() != null && !updateDetails.getUsername().isBlank()) {
            String newUsername = updateDetails.getUsername().trim();
            if (!newUsername.equalsIgnoreCase(user.getUsername())) {
                if (userRepository.findByUsernameAndUserIdNot(newUsername, userId).isPresent()) {
                    throw new IllegalArgumentException("Username is already taken");
                }
                user.setUsername(newUsername);
            }
        }

        if (updateDetails.getEmail() != null && !updateDetails.getEmail().isBlank()) {
            String newEmail = updateDetails.getEmail().trim();
            if (!newEmail.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.findByEmailAndUserIdNot(newEmail, userId).isPresent()) {
                    throw new IllegalArgumentException("Email is already registered");
                }
                user.setEmail(newEmail);
            }
        }

        if (updateDetails.getRole() != null) {
            user.setRole(updateDetails.getRole());
        }

        if (updateDetails.getPassword() != null && !updateDetails.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updateDetails.getPassword()));
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == User.Role.ADMIN) {
            throw new IllegalArgumentException("Cannot delete administrative accounts.");
        }

        // Check if user has active order history
        if (orderRepository.existsByUserId(userId)) {
            throw new IllegalArgumentException("Cannot delete customer because they have active order history.");
        }

        // Delete user cart items
        cartItemRepository.deleteByUserId(userId);

        // Delete user session tokens
        jwtTokenRepository.deleteByUserId(userId.longValue());

        // Delete user
        userRepository.deleteById(userId);
    }

    // --- Business Analytics ---

    public AnalyticsResponse getDailyAnalytics(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        List<Order> orders = orderRepository.findByStatusAndCreatedAtBetween(Order.Status.SUCCESS, start, end);
        return buildAnalyticsResponse(orders, "daily");
    }

    public AnalyticsResponse getMonthlyAnalytics(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(LocalTime.MAX);
        List<Order> orders = orderRepository.findByStatusAndCreatedAtBetween(Order.Status.SUCCESS, start, end);
        return buildAnalyticsResponse(orders, "monthly");
    }

    public AnalyticsResponse getYearlyAnalytics(int year) {
        LocalDateTime start = LocalDateTime.of(year, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(year, 12, 31, 23, 59, 59, 999999999);
        List<Order> orders = orderRepository.findByStatusAndCreatedAtBetween(Order.Status.SUCCESS, start, end);
        return buildAnalyticsResponse(orders, "yearly");
    }

    public AnalyticsResponse getOverallAnalytics() {
        List<Order> orders = orderRepository.findByStatus(Order.Status.SUCCESS);
        return buildAnalyticsResponse(orders, "overall");
    }

    private AnalyticsResponse buildAnalyticsResponse(List<Order> orders, String period) {
        BigDecimal totalRevenue = BigDecimal.ZERO;
        long transactionCount = orders.size();

        for (Order o : orders) {
            totalRevenue = totalRevenue.add(o.getTotalAmount());
        }

        BigDecimal averageOrderValue = BigDecimal.ZERO;
        if (transactionCount > 0) {
            averageOrderValue = totalRevenue.divide(BigDecimal.valueOf(transactionCount), 2, RoundingMode.HALF_UP);
        }

        // Map order ID to username
        Map<Integer, String> userNames = new HashMap<>();
        List<AnalyticsResponse.TransactionDetail> transactions = new ArrayList<>();
        for (Order o : orders) {
            String uname = userNames.computeIfAbsent(o.getUserId(), uid -> {
                return userRepository.findById(uid).map(User::getUsername).orElse("Unknown User");
            });
            transactions.add(new AnalyticsResponse.TransactionDetail(
                    o.getOrderId(),
                    uname,
                    o.getTotalAmount(),
                    o.getCreatedAt().toString(),
                    o.getStatus().name()
            ));
        }

        // Top Selling Products Calculation
        Map<Integer, ProductStats> productStatsMap = new HashMap<>();
        for (Order o : orders) {
            List<OrderItem> items = orderItemRepository.findByOrderId(o.getOrderId());
            for (OrderItem item : items) {
                ProductStats stats = productStatsMap.computeIfAbsent(item.getProductId(), pid -> {
                    String name = productRepository.findById(pid).map(Product::getName).orElse("Deleted Product (ID: " + pid + ")");
                    return new ProductStats(name);
                });
                stats.qty += item.getQuantity();
                stats.rev = stats.rev.add(item.getTotalPrice());
            }
        }

        List<AnalyticsResponse.TopProduct> topSelling = productStatsMap.values().stream()
                .map(stats -> new AnalyticsResponse.TopProduct(stats.name, stats.qty, stats.rev))
                .sorted(Comparator.comparing(AnalyticsResponse.TopProduct::getQuantitySold).reversed())
                .limit(5)
                .collect(Collectors.toList());

        // Trend calculation
        List<AnalyticsResponse.TrendData> trend = new ArrayList<>();
        if ("daily".equals(period)) {
            // Group by hour 0..23
            BigDecimal[] hours = new BigDecimal[24];
            Arrays.fill(hours, BigDecimal.ZERO);
            for (Order o : orders) {
                int hour = o.getCreatedAt().getHour();
                hours[hour] = hours[hour].add(o.getTotalAmount());
            }
            for (int i = 0; i < 24; i++) {
                String label = String.format("%02d:00", i);
                trend.add(new AnalyticsResponse.TrendData(label, hours[i]));
            }
        } else if ("monthly".equals(period)) {
            // Group by day of month (1 to 31)
            BigDecimal[] days = new BigDecimal[32]; // index 1..31
            Arrays.fill(days, BigDecimal.ZERO);
            for (Order o : orders) {
                int day = o.getCreatedAt().getDayOfMonth();
                if (day >= 1 && day <= 31) {
                    days[day] = days[day].add(o.getTotalAmount());
                }
            }
            for (int i = 1; i <= 31; i++) {
                trend.add(new AnalyticsResponse.TrendData(String.valueOf(i), days[i]));
            }
        } else if ("yearly".equals(period)) {
            // Group by Month (1 to 12)
            BigDecimal[] months = new BigDecimal[13]; // index 1..12
            Arrays.fill(months, BigDecimal.ZERO);
            for (Order o : orders) {
                int month = o.getCreatedAt().getMonthValue();
                if (month >= 1 && month <= 12) {
                    months[month] = months[month].add(o.getTotalAmount());
                }
            }
            String[] monthLabels = {"", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
            for (int i = 1; i <= 12; i++) {
                trend.add(new AnalyticsResponse.TrendData(monthLabels[i], months[i]));
            }
        } else {
            // Overall: group by year
            Map<Integer, BigDecimal> yearMap = new TreeMap<>();
            for (Order o : orders) {
                int year = o.getCreatedAt().getYear();
                yearMap.put(year, yearMap.getOrDefault(year, BigDecimal.ZERO).add(o.getTotalAmount()));
            }
            for (Map.Entry<Integer, BigDecimal> entry : yearMap.entrySet()) {
                trend.add(new AnalyticsResponse.TrendData(String.valueOf(entry.getKey()), entry.getValue()));
            }
            // If overall is empty, add current year with 0
            if (trend.isEmpty()) {
                trend.add(new AnalyticsResponse.TrendData(String.valueOf(LocalDate.now().getYear()), BigDecimal.ZERO));
            }
        }

        return new AnalyticsResponse(
                totalRevenue,
                transactionCount,
                averageOrderValue,
                topSelling,
                trend,
                transactions
        );
    }

    private static class ProductStats {
        String name;
        int qty = 0;
        BigDecimal rev = BigDecimal.ZERO;

        ProductStats(String name) {
            this.name = name;
        }
    }
}
