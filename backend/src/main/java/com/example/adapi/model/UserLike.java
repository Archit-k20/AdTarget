package com.example.adapi.model;

import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "user_likes",
    uniqueConstraints = @UniqueConstraint(columnNames = {"ad_id", "user_id"})
)
public class UserLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ad_id", nullable = false)
    private Long adId;

    @Column(name = "user_id", nullable = false)
    private Long userId;
}