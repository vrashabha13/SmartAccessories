package com.stringstack.ecommerce.repository;

import com.stringstack.ecommerce.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SessionRepository extends JpaRepository<Session, Long> {

    Optional<Session> findByJwtToken(String jwtToken);

    void deleteByJwtToken(String jwtToken);

    boolean existsByJwtToken(String jwtToken);
}
