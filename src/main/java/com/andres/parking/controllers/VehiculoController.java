package com.andres.parking.controllers;

import com.andres.parking.entities.Vehiculo;
import com.andres.parking.repositories.ConductorRepository;
import com.andres.parking.repositories.VehiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class VehiculoController {

    private final VehiculoRepository vehiculoRepository;
    private final ConductorRepository conductorRepository;

    @GetMapping("/api/conductores/{conductorId}/vehiculos")
    public ResponseEntity<List<Vehiculo>> listarPorConductor(@PathVariable Long conductorId) {
        return ResponseEntity.ok(vehiculoRepository.findByConductorId(conductorId));
    }

    @PostMapping("/api/vehiculos")
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body) {
        Long conductorId = Long.valueOf(body.get("conductorId").toString());

        return conductorRepository.findById(conductorId)
                .map(conductor -> {
                    String matricula = (String) body.get("matricula");

                    if (matricula != null && vehiculoRepository.existsByMatricula(matricula)) {
                        return ResponseEntity.badRequest().body((Object) Map.of("error", "Ya existe un vehículo con esa matrícula"));
                    }

                    Vehiculo vehiculo = Vehiculo.builder()
                            .matricula(matricula)
                            .marca((String) body.get("marca"))
                            .modelo((String) body.get("modelo"))
                            .color((String) body.get("color"))
                            .conductor(conductor)
                            .build();

                    return ResponseEntity.ok((Object) vehiculoRepository.save(vehiculo));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/api/vehiculos/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return vehiculoRepository.findById(id)
                .map(vehiculo -> {
                    if (body.containsKey("matricula")) vehiculo.setMatricula((String) body.get("matricula"));
                    if (body.containsKey("marca")) vehiculo.setMarca((String) body.get("marca"));
                    if (body.containsKey("modelo")) vehiculo.setModelo((String) body.get("modelo"));
                    if (body.containsKey("color")) vehiculo.setColor((String) body.get("color"));
                    return ResponseEntity.ok((Object) vehiculoRepository.save(vehiculo));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/vehiculos/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (!vehiculoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        vehiculoRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("mensaje", "Vehículo eliminado"));
    }
}