package com.stringstack.ecommerce.repository;

import com.stringstack.ecommerce.entity.JwtToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JwtTokenRepository extends JpaRepository<JwtToken, Integer> {

    Optional<JwtToken> findByToken(String token);

    void deleteByToken(String token);

    boolean existsByToken(String token);
}
