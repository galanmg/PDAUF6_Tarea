package com.andres.parking.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehiculos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String matricula;

    private String marca;

    private String modelo;

    private String color;

    @ManyToOne
    @JoinColumn(name = "conductor_id")
    private Conductor conductor;
}