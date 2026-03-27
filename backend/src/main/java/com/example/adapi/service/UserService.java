package com.example.adapi.service;

import com.example.adapi.dto.Userprofileresponse;
import com.example.adapi.exception.ResourceNotFoundException;
import com.example.adapi.model.User;
import com.example.adapi.repository.AdRepository;
import com.example.adapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AdRepository adRepository;

    @Transactional(readOnly = true)
    public Userprofileresponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Total ads published by this user
        long adCount = adRepository.countByUserId(userId);

        // Sum of likes across all ads by this user
        long totalLikes = adRepository.sumLikesByUserId(userId);

        return new Userprofileresponse(
            user.getId(),
            user.getFirstname(),
            user.getLastname(),
            user.getEmail(),
            user.getRole().name(),
            adCount,
            totalLikes
        );
    }
}