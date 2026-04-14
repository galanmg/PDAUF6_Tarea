package com.andres.parking.repositories;

import com.andres.parking.entities.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByPlazaId(Long plazaId);
    Optional<Pago> findByPlazaIdAndMesAndAnio(Long plazaId, int mes, int anio);
    boolean existsByPlazaIdAndMesAndAnio(Long plazaId, int mes, int anio);
}