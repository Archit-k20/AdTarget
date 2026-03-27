package com.example.adapi.repository;

import com.example.adapi.model.UserLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface Userlikerepository extends JpaRepository<UserLike, Long> {

    boolean existsByAdIdAndUserId(Long adId, Long userId);

    @Transactional
    @Modifying
    @Query("DELETE FROM UserLike ul WHERE ul.adId = :adId AND ul.userId = :userId")
    void deleteByAdIdAndUserId(@Param("adId") Long adId, @Param("userId") Long userId);

    @Transactional
    @Modifying
    @Query(value = "INSERT INTO user_likes (ad_id, user_id) VALUES (:adId, :userId)", nativeQuery = true)
    void saveAdLike(@Param("adId") Long adId, @Param("userId") Long userId);
}