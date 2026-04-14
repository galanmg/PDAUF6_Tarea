package com.andres.parking.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "pagos", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"plaza_id", "mes", "anio"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int mes; // 1-12

    private int anio;

    @Column(precision = 10, scale = 2)
    private BigDecimal cantidad;

    @Builder.Default
    private boolean pagado = false;

    @ManyToOne
    @JoinColumn(name = "plaza_id")
    private Plaza plaza;
}