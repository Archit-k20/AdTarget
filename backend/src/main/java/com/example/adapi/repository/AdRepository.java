package com.example.adapi.repository;

import com.example.adapi.model.Ad;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdRepository extends JpaRepository<Ad, Long> {

    // ── SEARCH ───────────────────────────────────────────────────────────────────

    // Keyword search via JOIN on the ad_keywords ElementCollection table
    @Query("SELECT a FROM Ad a JOIN a.keywords k WHERE LOWER(k) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Ad> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Broad search across title, description and keywords — DISTINCT prevents duplicate rows
    @Query("SELECT DISTINCT a FROM Ad a LEFT JOIN a.keywords k WHERE " +
           "LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(k) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Ad> findByKeywordInTitleDescriptionOrTags(@Param("keyword") String keyword, Pageable pageable);

    // ── USER ADS ─────────────────────────────────────────────────────────────────

    // Paginated ads for a specific user (My Ads tab)
    Page<Ad> findByUserId(Long userId, Pageable pageable);

    // ── PROFILE STATS ─────────────────────────────────────────────────────────────

    // Total number of ads published by a user
    long countByUserId(Long userId);

    // Sum of all likes across every ad by a user — returns 0 if no ads
    @Query("SELECT COALESCE(SUM(a.likes), 0) FROM Ad a WHERE a.user.id = :userId")
    long sumLikesByUserId(@Param("userId") Long userId);
}