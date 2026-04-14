package com.andres.parking.controllers;

import com.andres.parking.entities.Conductor;
import com.andres.parking.repositories.ConductorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conductores")
@RequiredArgsConstructor
public class ConductorController {

    private final ConductorRepository conductorRepository;

    @GetMapping
    public ResponseEntity<List<Conductor>> listarTodos() {
        return ResponseEntity.ok(conductorRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Conductor> obtenerPorId(@PathVariable Long id) {
        return conductorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Conductor conductor) {
        if (conductor.getDni() != null && conductorRepository.existsByDni(conductor.getDni())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya existe un conductor con ese DNI"));
        }
        return ResponseEntity.ok(conductorRepository.save(conductor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Conductor datos) {
        return conductorRepository.findById(id)
                .map(conductor -> {
                    conductor.setNombre(datos.getNombre());
                    conductor.setApellidos(datos.getApellidos());
                    conductor.setDni(datos.getDni());
                    conductor.setTelefono(datos.getTelefono());
                    conductor.setEmail(datos.getEmail());
                    return ResponseEntity.ok(conductorRepository.save(conductor));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (!conductorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        conductorRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("mensaje", "Conductor eliminado"));
    }
}