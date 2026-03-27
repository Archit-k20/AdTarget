package com.example.adapi.controller;

import com.example.adapi.dto.Userprofileresponse;
import com.example.adapi.model.User;
import com.example.adapi.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users/me
     * Returns the logged-in user's profile: name, email, ad count, total likes received.
     */
    @GetMapping("/me")
    public ResponseEntity<Userprofileresponse> getMyProfile(
        @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(userService.getUserProfile(currentUser.getId()));
    }
}