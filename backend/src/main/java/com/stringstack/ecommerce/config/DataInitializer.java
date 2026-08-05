package com.stringstack.ecommerce.config;

import com.stringstack.ecommerce.entity.Category;
import com.stringstack.ecommerce.entity.User;
import com.stringstack.ecommerce.repository.CategoryRepository;
import com.stringstack.ecommerce.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed Categories
        if (categoryRepository.count() == 0) {
            List<String> defaultCategories = List.of(
                    "Chargers",
                    "Cases",
                    "Screen Protectors",
                    "Cables",
                    "Power Banks"
            );
            for (String catName : defaultCategories) {
                Category category = new Category();
                category.setCategoryName(catName);
                categoryRepository.save(category);
            }
            System.out.println("Seeded default product categories.");
        }

        // Seed Default Admin Account
        String adminEmail = "admin@smartaccessories.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("AdminPassword123!"));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Seeded default admin user: " + adminEmail);
        }
    }
}
