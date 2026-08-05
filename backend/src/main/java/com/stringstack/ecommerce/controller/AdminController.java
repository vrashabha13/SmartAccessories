package com.stringstack.ecommerce.controller;

import com.stringstack.ecommerce.dto.AnalyticsResponse;
import com.stringstack.ecommerce.dto.MessageResponse;
import com.stringstack.ecommerce.dto.ProductDTO;
import com.stringstack.ecommerce.entity.User;
import com.stringstack.ecommerce.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // --- Product Management ---

    @PostMapping("/products")
    public ResponseEntity<ProductDTO> addProduct(@RequestBody ProductDTO productDTO) {
        ProductDTO created = adminService.addProduct(productDTO);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<MessageResponse> deleteProduct(@PathVariable Integer productId) {
        adminService.deleteProduct(productId);
        return ResponseEntity.ok(new MessageResponse("Product deleted successfully"));
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Integer productId, @RequestBody ProductDTO productDTO) {
        ProductDTO updated = adminService.updateProduct(productId, productDTO);
        return ResponseEntity.ok(updated);
    }

    // --- User Management ---

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable Integer userId, @RequestBody User updateDetails) {
        User updated = adminService.updateUser(userId, updateDetails);
        updated.setPassword(null); // Clean password
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Integer userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }

    // --- Business Analytics ---

    @GetMapping("/analytics/daily")
    public ResponseEntity<AnalyticsResponse> getDailyAnalytics(
            @RequestParam(value = "date", required = false) String dateStr) {
        LocalDate date = (dateStr == null || dateStr.isBlank()) ? LocalDate.now() : LocalDate.parse(dateStr);
        return ResponseEntity.ok(adminService.getDailyAnalytics(date));
    }

    @GetMapping("/analytics/monthly")
    public ResponseEntity<AnalyticsResponse> getMonthlyAnalytics(
            @RequestParam("year") int year,
            @RequestParam("month") int month) {
        return ResponseEntity.ok(adminService.getMonthlyAnalytics(year, month));
    }

    @GetMapping("/analytics/yearly")
    public ResponseEntity<AnalyticsResponse> getYearlyAnalytics(
            @RequestParam("year") int year) {
        return ResponseEntity.ok(adminService.getYearlyAnalytics(year));
    }

    @GetMapping("/analytics/overall")
    public ResponseEntity<AnalyticsResponse> getOverallAnalytics() {
        return ResponseEntity.ok(adminService.getOverallAnalytics());
    }
}
