package com.cloudstorage.service;

import com.cloudstorage.dto.AuthResponse;
import com.cloudstorage.dto.LoginRequest;
import com.cloudstorage.dto.RegisterRequest;
import com.cloudstorage.model.User;
import com.cloudstorage.repository.UserRepository;
import com.cloudstorage.security.JwtTokenProvider;
import com.cloudstorage.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Email address is already in use!");
        }

        User user = User.builder()
                .email(registerRequest.getEmail())
                .passwordHash(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName())
                .role("ROLE_USER")
                .authProvider("LOCAL")
                .storageUsed(0L)
                .storageLimit(15L * 1024 * 1024 * 1024) // 15GB
                .build();

        User savedUser = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getEmail(),
                        registerRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(
                jwt,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole(),
                savedUser.getStorageUsed(),
                savedUser.getStorageLimit()
        );
    }

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getStorageUsed(),
                user.getStorageLimit()
        );
    }

    public AuthResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthResponse(
                null,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getStorageUsed(),
                user.getStorageLimit()
        );
    }

    @Transactional
    public AuthResponse googleLogin(com.cloudstorage.dto.GoogleAuthRequest request) {
        String email = request.getEmail();
        String fullName = request.getFullName();

        if ((email == null || email.isBlank()) && request.getIdToken() != null) {
            try {
                String[] parts = request.getIdToken().split("\\.");
                if (parts.length >= 2) {
                    String body = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
                    if (body.contains("\"email\":\"")) {
                        int start = body.indexOf("\"email\":\"") + 9;
                        int end = body.indexOf("\"", start);
                        email = body.substring(start, end);
                    }
                    if (body.contains("\"name\":\"")) {
                        int start = body.indexOf("\"name\":\"") + 8;
                        int end = body.indexOf("\"", start);
                        fullName = body.substring(start, end);
                    }
                }
            } catch (Exception ignored) {}
        }

        if (email == null || email.isBlank()) {
            email = "google.user." + System.currentTimeMillis() + "@gmail.com";
        }
        if (fullName == null || fullName.isBlank()) {
            fullName = email.split("@")[0];
        }

        final String finalEmail = email;
        final String finalFullName = fullName;

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(finalEmail)
                    .fullName(finalFullName)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role("ROLE_USER")
                    .authProvider("GOOGLE")
                    .storageUsed(0L)
                    .storageLimit(15L * 1024 * 1024 * 1024)
                    .build();
            return userRepository.save(newUser);
        });

        String jwt = tokenProvider.generateTokenFromUser(user);

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getStorageUsed(),
                user.getStorageLimit()
        );
    }
}
