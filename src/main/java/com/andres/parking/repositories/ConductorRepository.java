package com.andres.parking.repositories;

import com.andres.parking.entities.Conductor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConductorRepository extends JpaRepository<Conductor, Long> {
    Optional<Conductor> findByDni(String dni);
    boolean existsByDni(String dni);
}