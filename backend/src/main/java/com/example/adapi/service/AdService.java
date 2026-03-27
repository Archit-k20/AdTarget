package com.example.adapi.service;

import com.example.adapi.exception.ResourceNotFoundException;
import com.example.adapi.model.Ad;
import com.example.adapi.repository.AdRepository;
import com.example.adapi.repository.Userlikerepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdService {

    private final AdRepository adRepository;
    private final Userlikerepository userlikeRepository;

    // ── CRUD ─────────────────────────────────────────────────────────────────────

    @Transactional
    public Ad saveAd(Ad ad) {
        return adRepository.save(ad);
    }

    public Optional<Ad> getAdById(Long id) {
        return adRepository.findById(id);
    }

    @Transactional
    public void deleteAd(Long id) {
        adRepository.deleteById(id);
    }

    // ── QUERIES ──────────────────────────────────────────────────────────────────

    public Page<Ad> getAllAds(Pageable pageable) {
        return adRepository.findAll(pageable);
    }

    public Page<Ad> searchByKeyword(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return adRepository.findAll(pageable);
        }
        return adRepository.findByKeywordInTitleDescriptionOrTags(keyword.trim(), pageable);
    }

    public Page<Ad> getAdsByUser(Long userId, Pageable pageable) {
        return adRepository.findByUserId(userId, pageable);
    }

    // ── LIKE (toggle) ─────────────────────────────────────────────────────────────

    @Transactional
    public Ad toggleLike(Long adId, Long userId) {
        Ad ad = adRepository.findById(adId)
            .orElseThrow(() -> new ResourceNotFoundException("Ad not found with id: " + adId));

        boolean alreadyLiked = userlikeRepository.existsByAdIdAndUserId(adId, userId);

        if (alreadyLiked) {
            userlikeRepository.deleteByAdIdAndUserId(adId, userId);
            ad.setLikes(Math.max(0, ad.getLikes() - 1));
        } else {
            userlikeRepository.saveAdLike(adId, userId);
            ad.setLikes(ad.getLikes() + 1);
        }

        return adRepository.save(ad);
    }

    // ── VIEWS ─────────────────────────────────────────────────────────────────────

    @Transactional
    public void incrementViews(Long adId) {
        Ad ad = adRepository.findById(adId)
            .orElseThrow(() -> new ResourceNotFoundException("Ad not found with id: " + adId));
        ad.setViews(ad.getViews() + 1);
        adRepository.save(ad);
    }
}