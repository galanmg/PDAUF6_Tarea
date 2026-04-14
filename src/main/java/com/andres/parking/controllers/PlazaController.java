package com.andres.parking.controllers;

import com.andres.parking.entities.Plaza;
import com.andres.parking.repositories.ConductorRepository;
import com.andres.parking.repositories.PlazaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/plazas")
@RequiredArgsConstructor
public class PlazaController {

    private final PlazaRepository plazaRepository;
    private final ConductorRepository conductorRepository;

    @GetMapping
    public ResponseEntity<List<Plaza>> listarTodas(@RequestParam(required = false) Integer planta) {
        if (planta != null) {
            return ResponseEntity.ok(plazaRepository.findByPlanta(planta));
        }
        return ResponseEntity.ok(plazaRepository.findAll());
    }

    @PutMapping("/{id}/asignar/{conductorId}")
    public ResponseEntity<?> asignar(@PathVariable Long id, @PathVariable Long conductorId) {
        var plazaOpt = plazaRepository.findById(id);
        var conductorOpt = conductorRepository.findById(conductorId);

        if (plazaOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Plaza no encontrada"));
        }
        if (conductorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Conductor no encontrado"));
        }

        Plaza plaza = plazaOpt.get();
        if (plaza.isOcupada()) {
            return ResponseEntity.badRequest().body(Map.of("error", "La plaza ya está ocupada"));
        }

        plaza.setConductor(conductorOpt.get());
        plaza.setOcupada(true);
        return ResponseEntity.ok(plazaRepository.save(plaza));
    }

    @PutMapping("/{id}/liberar")
    public ResponseEntity<?> liberar(@PathVariable Long id) {
        return plazaRepository.findById(id)
                .map(plaza -> {
                    if (!plaza.isOcupada()) {
                        return ResponseEntity.badRequest().body((Object) Map.of("error", "La plaza ya está libre"));
                    }
                    plaza.setConductor(null);
                    plaza.setOcupada(false);
                    return ResponseEntity.ok((Object) plazaRepository.save(plaza));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/tarifa")
    public ResponseEntity<?> actualizarTarifa(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return plazaRepository.findById(id)
                .map(plaza -> {
                    BigDecimal nuevaTarifa = new BigDecimal(body.get("tarifa").toString());
                    plaza.setTarifa(nuevaTarifa);
                    return ResponseEntity.ok((Object) plazaRepository.save(plaza));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}