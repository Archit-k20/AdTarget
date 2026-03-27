package com.example.adapi.dto;

public record Userprofileresponse(
    Long id,
    String firstname,
    String lastname,
    String email,
    String role,
    long adCount,
    long totalLikes
) {}