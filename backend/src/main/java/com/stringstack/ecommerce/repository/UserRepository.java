package com.stringstack.ecommerce.repository;

import com.stringstack.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmailAndUserIdNot(String email, Integer userId);

    Optional<User> findByUsernameAndUserIdNot(String username, Integer userId);
}
