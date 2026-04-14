package com.andres.parking.controllers;

import com.andres.parking.entities.Pago;
import com.andres.parking.repositories.PagoRepository;
import com.andres.parking.repositories.PlazaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PagoController {

    private final PagoRepository pagoRepository;
    private final PlazaRepository plazaRepository;

    @GetMapping("/api/plazas/{plazaId}/pagos")
    public ResponseEntity<List<Pago>> listarPorPlaza(@PathVariable Long plazaId) {
        return ResponseEntity.ok(pagoRepository.findByPlazaId(plazaId));
    }

    @PostMapping("/api/pagos")
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body) {
        Long plazaId = Long.valueOf(body.get("plazaId").toString());
        int mes = Integer.parseInt(body.get("mes").toString());
        int anio = Integer.parseInt(body.get("anio").toString());

        return plazaRepository.findById(plazaId)
                .map(plaza -> {
                    if (!plaza.isOcupada()) {
                        return ResponseEntity.badRequest().body((Object) Map.of("error", "No se puede registrar un pago en una plaza libre"));
                    }

                    if (pagoRepository.existsByPlazaIdAndMesAndAnio(plazaId, mes, anio)) {
                        return ResponseEntity.badRequest().body((Object) Map.of("error", "Ya existe un pago para esa plaza en ese mes/año"));
                    }

                    Pago pago = Pago.builder()
                            .plaza(plaza)
                            .mes(mes)
                            .anio(anio)
                            .cantidad(plaza.getTarifa())
                            .pagado(false)
                            .build();

                    return ResponseEntity.ok((Object) pagoRepository.save(pago));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/api/pagos/{id}/toggle")
    public ResponseEntity<?> togglePagado(@PathVariable Long id) {
        return pagoRepository.findById(id)
                .map(pago -> {
                    pago.setPagado(!pago.isPagado());
                    return ResponseEntity.ok((Object) pagoRepository.save(pago));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/pagos/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (!pagoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        pagoRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("mensaje", "Pago eliminado"));
    }
}