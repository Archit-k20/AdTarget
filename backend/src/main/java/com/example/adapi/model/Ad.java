package com.example.adapi.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ads")
public class Ad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ElementCollection stored in a separate join table — fixed for proper JPQL JOIN
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ad_keywords", joinColumns = @JoinColumn(name = "ad_id"))
    @Column(name = "keyword")
    @Builder.Default
    private List<String> keywords = new ArrayList<>();

    private String imageUrl;

    @Builder.Default
    private int likes = 0;

    @Builder.Default
    private int views = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Associate ad with the logged-in user — LAZY to avoid N+1, JsonIgnoreProperties to prevent recursion
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"ads", "password", "authorities", "accountNonExpired",
                           "accountNonLocked", "credentialsNonExpired", "enabled", "hibernateLazyInitializer"})
    private User user;
}