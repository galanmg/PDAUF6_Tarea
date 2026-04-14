package com.andres.parking.repositories;

import com.andres.parking.entities.Plaza;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlazaRepository extends JpaRepository<Plaza, Long> {
    List<Plaza> findByPlanta(int planta);
    List<Plaza> findByConductorId(Long conductorId);
    long count();
}