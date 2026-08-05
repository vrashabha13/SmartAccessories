package com.stringstack.ecommerce.repository;

import com.stringstack.ecommerce.entity.JwtToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;

public interface JwtTokenRepository extends JpaRepository<JwtToken, Integer> {

    Optional<JwtToken> findByToken(String token);

    void deleteByToken(String token);

    void deleteByUserId(Long userId);

    @Modifying
    @Query("delete from JwtToken t where t.expiresAt < :dateTime")
    int deleteByExpiresAtBefore(LocalDateTime dateTime);

    boolean existsByToken(String token);
}
