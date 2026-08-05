package com.stringstack.ecommerce.service;

import com.stringstack.ecommerce.dto.ProductDTO;
import com.stringstack.ecommerce.entity.Product;
import com.stringstack.ecommerce.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminServiceTest {

    private AdminService adminService;

    @Mock private ProductRepository productRepository;
    @Mock private ProductImageRepository productImageRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private JwtTokenRepository jwtTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        adminService = new AdminService(
                productRepository,
                productImageRepository,
                categoryRepository,
                userRepository,
                cartItemRepository,
                orderRepository,
                orderItemRepository,
                jwtTokenRepository,
                passwordEncoder
        );
    }

    @Test
    void testAddProduct_Success() {
        ProductDTO dto = new ProductDTO();
        dto.setName("Coil Charger");
        dto.setPrice(BigDecimal.valueOf(499.00));
        dto.setStock(20);
        dto.setCategoryId(1);
        dto.setImageUrl("https://example.com/image.jpg");

        when(categoryRepository.existsById(1)).thenReturn(true);
        when(productRepository.existsByNameIgnoreCase("Coil Charger")).thenReturn(false);

        Product savedProduct = new Product();
        savedProduct.setProductId(101);
        savedProduct.setName("Coil Charger");
        savedProduct.setPrice(BigDecimal.valueOf(499.00));
        savedProduct.setStock(20);
        savedProduct.setCategoryId(1);

        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        ProductDTO result = adminService.addProduct(dto);

        assertNotNull(result);
        assertEquals(101, result.getProductId());
        assertEquals("Coil Charger", result.getName());
        verify(productRepository, times(1)).save(any(Product.class));
        verify(productImageRepository, times(1)).save(any());
    }

    @Test
    void testAddProduct_InvalidCategory() {
        ProductDTO dto = new ProductDTO();
        dto.setName("Coil Charger");
        dto.setPrice(BigDecimal.valueOf(499.00));
        dto.setStock(20);
        dto.setCategoryId(999);

        when(categoryRepository.existsById(999)).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            adminService.addProduct(dto);
        });

        assertEquals("Invalid product category ID", exception.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    void testAddProduct_DuplicateName() {
        ProductDTO dto = new ProductDTO();
        dto.setName("Coil Charger");
        dto.setPrice(BigDecimal.valueOf(499.00));
        dto.setStock(20);
        dto.setCategoryId(1);

        when(categoryRepository.existsById(1)).thenReturn(true);
        when(productRepository.existsByNameIgnoreCase("Coil Charger")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            adminService.addProduct(dto);
        });

        assertEquals("Product with name 'Coil Charger' already exists", exception.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    void testDeleteProduct_HasOrderHistory() {
        when(productRepository.existsById(101)).thenReturn(true);
        when(orderItemRepository.existsByProductId(101)).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            adminService.deleteProduct(101);
        });

        assertTrue(exception.getMessage().contains("Cannot delete product because it has associated orders"));
        verify(productRepository, never()).deleteById(any());
    }

    @Test
    void testUpdateProduct_Success() {
        Product existingProduct = new Product();
        existingProduct.setProductId(101);
        existingProduct.setName("Old Name");
        existingProduct.setPrice(BigDecimal.valueOf(100.00));
        existingProduct.setStock(10);
        existingProduct.setCategoryId(1);

        ProductDTO dto = new ProductDTO();
        dto.setName("New Name");
        dto.setPrice(BigDecimal.valueOf(150.00));
        dto.setStock(15);
        dto.setCategoryId(2);
        dto.setImageUrl("https://newimage.com/img.jpg");

        when(productRepository.findById(101)).thenReturn(Optional.of(existingProduct));
        when(categoryRepository.existsById(2)).thenReturn(true);
        when(productRepository.findByNameIgnoreCaseAndProductIdNot("New Name", 101)).thenReturn(Optional.empty());
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductDTO result = adminService.updateProduct(101, dto);

        assertNotNull(result);
        assertEquals("New Name", result.getName());
        assertEquals(BigDecimal.valueOf(150.00), result.getPrice());
        assertEquals(15, result.getStock());
        assertEquals(2, result.getCategoryId());
    }

    @Test
    void testDeleteUser_Success() {
        com.stringstack.ecommerce.entity.User user = new com.stringstack.ecommerce.entity.User();
        user.setUserId(202);
        user.setRole(com.stringstack.ecommerce.entity.User.Role.CUSTOMER);

        when(userRepository.findById(202)).thenReturn(Optional.of(user));
        when(orderRepository.existsByUserId(202)).thenReturn(false);

        adminService.deleteUser(202);

        verify(cartItemRepository, times(1)).deleteByUserId(202);
        verify(jwtTokenRepository, times(1)).deleteByUserId(202L);
        verify(userRepository, times(1)).deleteById(202);
    }

    @Test
    void testDeleteUser_AdminRejected() {
        com.stringstack.ecommerce.entity.User user = new com.stringstack.ecommerce.entity.User();
        user.setUserId(202);
        user.setRole(com.stringstack.ecommerce.entity.User.Role.ADMIN);

        when(userRepository.findById(202)).thenReturn(Optional.of(user));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            adminService.deleteUser(202);
        });

        assertEquals("Cannot delete administrative accounts.", exception.getMessage());
        verify(userRepository, never()).deleteById(any());
    }
}
