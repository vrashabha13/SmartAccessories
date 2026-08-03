package com.stringstack.ecommerce.controller;

import com.stringstack.ecommerce.dto.CartItemRequest;
import com.stringstack.ecommerce.dto.CartItemResponse;
import com.stringstack.ecommerce.dto.CartResponse;
import com.stringstack.ecommerce.dto.MessageResponse;
import com.stringstack.ecommerce.service.CartService;
import com.stringstack.ecommerce.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class CartController {

    private final CartService cartService;
    private final JwtService jwtService;

    public CartController(CartService cartService, JwtService jwtService) {
        this.cartService = cartService;
        this.jwtService = jwtService;
    }

    @GetMapping("/cart")
    public ResponseEntity<CartResponse> getCart(HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(cartService.getCartItems(userId));
    }

    @GetMapping("/cart/count")
    public ResponseEntity<Map<String, Integer>> getCartCount(HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(Map.of("count", cartService.getCartCount(userId)));
    }

    @PostMapping("/cart")
    public ResponseEntity<CartItemResponse> addToCart(HttpServletRequest request,
                                                       @RequestBody CartItemRequest cartRequest) {
        Integer userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(cartService.addToCart(userId, cartRequest));
    }

    @PutMapping("/cart/{cartItemId}")
    public ResponseEntity<CartItemResponse> updateCartItem(
            HttpServletRequest request,
            @PathVariable Long cartItemId,
            @RequestBody CartItemRequest cartRequest) {
        Integer userId = getUserIdFromRequest(request);
        CartItemResponse response = cartService.updateCartItemQuantity(cartItemId, userId, cartRequest.getQuantity());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/cart/{cartItemId}")
    public ResponseEntity<MessageResponse> removeFromCart(
            HttpServletRequest request,
            @PathVariable Long cartItemId) {
        Integer userId = getUserIdFromRequest(request);
        cartService.removeFromCart(cartItemId, userId);
        return ResponseEntity.ok(new MessageResponse("Item removed from cart"));
    }

    private Integer getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = jwtService.extractEmail(token);
            return jwtService.getUserIdByEmail(email);
        }
        throw new RuntimeException("Unauthorized");
    }
}
