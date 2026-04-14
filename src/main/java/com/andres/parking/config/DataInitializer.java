package com.andres.parking.config;

import com.andres.parking.entities.Plaza;
import com.andres.parking.repositories.PlazaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final PlazaRepository plazaRepository;

    @Override
    public void run(String... args) {
        if (plazaRepository.count() == 0) {
            List<Plaza> plazas = new ArrayList<>();

            for (int planta = 0; planta <= 1; planta++) {
                for (int numero = 1; numero <= 22; numero++) {
                    plazas.add(Plaza.builder()
                            .numero(numero)
                            .planta(planta)
                            .ocupada(false)
                            .tarifa(new BigDecimal("40.00"))
                            .build());
                }
            }

            plazaRepository.saveAll(plazas);
            System.out.println("✅ 44 plazas inicializadas correctamente");
        }
    }
}