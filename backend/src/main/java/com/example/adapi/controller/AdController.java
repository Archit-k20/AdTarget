package com.example.adapi.controller;

import com.example.adapi.exception.ResourceNotFoundException;
import com.example.adapi.exception.UnauthorizedException;
import com.example.adapi.model.Ad;
import com.example.adapi.model.User;
import com.example.adapi.service.AdService;
import com.example.adapi.service.MinioService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Validated
@RestController
@RequestMapping("/api/ads")
@RequiredArgsConstructor
public class AdController {

    private final AdService adService;
    private final MinioService minioService;

    // ── CREATE ──────────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<Ad> createAd(
        @RequestParam @NotBlank(message = "Title is required") String title,
        @RequestParam @NotBlank(message = "Description is required") String description,
        @RequestParam @NotBlank(message = "Keywords are required") String keywords,
        @RequestParam(value = "image", required = false) MultipartFile image,
        @AuthenticationPrincipal User currentUser
    ) {
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = minioService.uploadImage(image);
        }

        Ad ad = Ad.builder()
            .title(title)
            .description(description)
            .keywords(parseKeywords(keywords))
            .imageUrl(imageUrl)
            .user(currentUser)
            .build();

        return ResponseEntity.ok(adService.saveAd(ad));
    }

    // ── READ ─────────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Page<Ad>> getAllAds(
        @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(adService.getAllAds(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ad> getAdById(@PathVariable Long id) {
        Ad ad = adService.getAdById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ad not found with id: " + id));
        return ResponseEntity.ok(ad);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Ad>> search(
        @RequestParam String keyword,
        @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(adService.searchByKeyword(keyword, pageable));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<Ad>> getMyAds(
        @AuthenticationPrincipal User currentUser,
        @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(adService.getAdsByUser(currentUser.getId(), pageable));
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<Ad> updateAd(
        @PathVariable Long id,
        @RequestParam(required = false) String title,
        @RequestParam(required = false) String description,
        @RequestParam(required = false) String keywords,
        @RequestParam(value = "image", required = false) MultipartFile image,
        @AuthenticationPrincipal User currentUser
    ) {
        Ad existing = adService.getAdById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ad not found with id: " + id));

        assertOwnership(existing, currentUser, "update");

        if (title != null && !title.isBlank())       existing.setTitle(title);
        if (description != null && !description.isBlank()) existing.setDescription(description);
        if (keywords != null && !keywords.isBlank())  existing.setKeywords(parseKeywords(keywords));

        if (image != null && !image.isEmpty()) {
            // Delete old image from MinIO before uploading new one
            if (existing.getImageUrl() != null) {
                minioService.deleteImage(existing.getImageUrl());
            }
            existing.setImageUrl(minioService.uploadImage(image));
        }

        return ResponseEntity.ok(adService.saveAd(existing));
    }

    // ── DELETE ───────────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAd(
        @PathVariable Long id,
        @AuthenticationPrincipal User currentUser
    ) {
        Ad existing = adService.getAdById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ad not found with id: " + id));

        assertOwnership(existing, currentUser, "delete");

        // Clean up image from MinIO
        if (existing.getImageUrl() != null) {
            minioService.deleteImage(existing.getImageUrl());
        }

        adService.deleteAd(id);
        return ResponseEntity.noContent().build();
    }

    // ── LIKE / VIEWS ─────────────────────────────────────────────────────────────

    @PostMapping("/{id}/like")
    public ResponseEntity<Ad> toggleLike(
        @PathVariable Long id,
        @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(adService.toggleLike(id, currentUser.getId()));
    }

    @PatchMapping("/{id}/views")
    public ResponseEntity<Void> incrementViews(@PathVariable Long id) {
        adService.incrementViews(id);
        return ResponseEntity.noContent().build();
    }

    // ── HELPERS ──────────────────────────────────────────────────────────────────

    private void assertOwnership(Ad ad, User currentUser, String action) {
        if (ad.getUser() != null && !ad.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException(
                "You do not have permission to " + action + " this ad");
        }
    }

    private List<String> parseKeywords(String raw) {
        return Arrays.stream(raw.split(","))
            .map(String::trim)
            .filter(k -> !k.isEmpty())
            .collect(Collectors.toList());
    }
}