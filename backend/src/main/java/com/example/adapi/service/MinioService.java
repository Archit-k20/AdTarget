package com.example.adapi.service;

import com.example.adapi.config.MinioConfig;
import io.minio.*;
import io.minio.errors.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    /**
     * Uploads a multipart file to MinIO and returns the public URL.
     * All image uploads must go through this method — no filesystem fallback.
     */
    public String uploadImage(MultipartFile file) {
        validateImage(file);

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String objectName = "ads/" + UUID.randomUUID() + extension;

        try {
            ensureBucketExists();

            try (InputStream inputStream = file.getInputStream()) {
                minioClient.putObject(
                    PutObjectArgs.builder()
                        .bucket(minioConfig.getBucket())
                        .object(objectName)
                        .stream(inputStream, file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
                );
            }

            // Return the publicly accessible URL
            return minioConfig.getUrl() + "/" + minioConfig.getBucket() + "/" + objectName;

        } catch (MinioException | IOException | InvalidKeyException | NoSuchAlgorithmException e) {
            log.error("MinIO upload failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload image to storage: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes an object from MinIO by its full URL.
     */
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;

        try {
            String prefix = minioConfig.getUrl() + "/" + minioConfig.getBucket() + "/";
            if (imageUrl.startsWith(prefix)) {
                String objectName = imageUrl.substring(prefix.length());
                minioClient.removeObject(
                    RemoveObjectArgs.builder()
                        .bucket(minioConfig.getBucket())
                        .object(objectName)
                        .build()
                );
            }
        } catch (Exception e) {
            log.warn("Failed to delete image from MinIO: {}", e.getMessage());
            // Non-fatal — log and continue
        }
    }

    private void ensureBucketExists() throws MinioException, IOException, InvalidKeyException, NoSuchAlgorithmException {
        String bucketName = minioConfig.getBucket();

        boolean exists = minioClient.bucketExists(
            BucketExistsArgs.builder().bucket(bucketName).build()
        );

        if (!exists) {
            // 1. Create the bucket
            minioClient.makeBucket(
                MakeBucketArgs.builder().bucket(bucketName).build()
            );
            log.info("Created MinIO bucket: {}", bucketName);

            // 2. Define the public read policy JSON for 'bucketname/ads/*' prefix
            // This is a standard AWS-style IAM policy string
            String policy = "{\n" +
                    "  \"Version\": \"2012-10-17\",\n" +
                    "  \"Statement\": [\n" +
                    "    {\n" +
                    "      \"Effect\": \"Allow\",\n" +
                    "      \"Principal\": {\"AWS\": [\"*\"]},\n" +
                    "      \"Action\": [\"s3:GetObject\"],\n" +
                    "      \"Resource\": [\"arn:aws:s3:::" + bucketName + "/ads/*\"]\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}";

            // 3. Apply the policy to the bucket
            minioClient.setBucketPolicy(
                SetBucketPolicyArgs.builder().bucket(bucketName).config(policy).build()
            );
            log.info("Set public read policy on folder /ads in bucket: {}", bucketName);
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file must not be empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed (jpeg, png, gif, webp)");
        }
        // Max 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Image size must not exceed 10MB");
        }
    }
}