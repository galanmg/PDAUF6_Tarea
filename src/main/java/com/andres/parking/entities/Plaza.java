package com.andres.parking.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plazas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plaza {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int numero; // 1-22

    private int planta; // 0 = baja, 1 = primera

    @Builder.Default
    private boolean ocupada = false;

    @Builder.Default
    @Column(precision = 10, scale = 2)
    private BigDecimal tarifa = new BigDecimal("40.00");

    @ManyToOne
    @JoinColumn(name = "conductor_id", nullable = true)
    private Conductor conductor;

    @OneToMany(mappedBy = "plaza", cascade = CascadeType.ALL)
    @JsonIgnore
    @Builder.Default
    private List<Pago> pagos = new ArrayList<>();
}