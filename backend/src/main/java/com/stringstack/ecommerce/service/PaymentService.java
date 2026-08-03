package com.stringstack.ecommerce.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.stringstack.ecommerce.dto.CreateOrderResponse;
import com.stringstack.ecommerce.dto.PaymentVerifyRequest;
import com.stringstack.ecommerce.dto.PaymentVerifyResponse;
import com.stringstack.ecommerce.entity.CartItem;
import com.stringstack.ecommerce.entity.OrderItem;
import com.stringstack.ecommerce.entity.Order;
import com.stringstack.ecommerce.entity.Product;
import com.stringstack.ecommerce.repository.CartItemRepository;
import com.stringstack.ecommerce.repository.OrderItemRepository;
import com.stringstack.ecommerce.repository.OrderRepository;
import com.stringstack.ecommerce.repository.ProductRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final String razorpayKeyId;
    private final String razorpayKeySecret;
    private final RazorpayClient razorpayClient;

    public PaymentService(CartItemRepository cartItemRepository,
                          ProductRepository productRepository,
                          OrderRepository orderRepository,
                          OrderItemRepository orderItemRepository,
                          @Value("${razorpay.key-id}") String razorpayKeyId,
                          @Value("${razorpay.key-secret}") String razorpayKeySecret) throws RazorpayException {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.razorpayKeyId = razorpayKeyId;
        this.razorpayKeySecret = razorpayKeySecret;
        this.razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
    }

    @Transactional
    public CreateOrderResponse createOrder(Integer userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cart is empty. Add products before checkout.");
        }

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        String internalOrderId = "SA-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", total.multiply(BigDecimal.valueOf(100)).intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", internalOrderId);
            orderRequest.put("payment_capture", 1);
            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            Order order = new Order();
            order.setOrderId(internalOrderId);
            order.setUserId(userId);
            order.setTotalAmount(total);
            order.setStatus(Order.Status.PENDING);
            orderRepository.save(order);

            CreateOrderResponse response = new CreateOrderResponse();
            response.setOrderId(internalOrderId);
            response.setRazorpayOrderId(razorpayOrderId);
            response.setAmount(total);
            response.setCurrency("INR");
            response.setRazorpayKeyId(razorpayKeyId);
            return response;
        } catch (RazorpayException ex) {
            throw new RuntimeException("Failed to create payment order: " + ex.getMessage());
        }
    }

    @Transactional
    public PaymentVerifyResponse verifyPayment(Integer userId, PaymentVerifyRequest request) {
        if (request.getRazorpayPaymentId() == null || request.getRazorpaySignature() == null
                || request.getRazorpayOrderId() == null) {
            throw new IllegalArgumentException("Payment details are incomplete");
        }

        boolean verified = verifySignature(request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(), request.getRazorpaySignature());

        if (!verified) {
            Order failed = orderRepository.findById(request.getOrderId()).orElse(null);
            if (failed != null) {
                failed.setStatus(Order.Status.FAILED);
                orderRepository.save(failed);
            }
            throw new IllegalArgumentException("Payment signature verification failed");
        }

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(Order.Status.SUCCESS);
        orderRepository.save(order);

        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        for (CartItem item : cartItems) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product != null) {
                int newStock = Math.max(0, product.getStock() - item.getQuantity());
                product.setStock(newStock);
                productRepository.save(product);

                OrderItem orderItem = new OrderItem();
                orderItem.setOrderId(order.getOrderId());
                orderItem.setProductId(item.getProductId());
                orderItem.setQuantity(item.getQuantity());
                orderItem.setPricePerUnit(product.getPrice());
                orderItem.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                orderItemRepository.save(orderItem);
            }
        }

        cartItemRepository.deleteByUserId(userId);

        PaymentVerifyResponse response = new PaymentVerifyResponse();
        response.setMessage("Payment verified successfully");
        response.setOrderId(order.getOrderId());
        response.setVerified(true);
        return response;
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            return Utils.verifySignature(payload, signature, razorpayKeySecret);
        } catch (RazorpayException ex) {
            return false;
        }
    }
}
