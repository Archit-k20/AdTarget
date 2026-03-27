package com.example.adapi;

import com.example.adapi.config.MinioConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
@EnableConfigurationProperties(MinioConfig.class)
public class AdapiApplication implements WebMvcConfigurer {

    public static void main(String[] args) {
        SpringApplication.run(AdapiApplication.class, args);
    }

    // Serves files from the local /uploads directory at /uploads/** URL path
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations(
                "file:" + System.getProperty("user.dir") + "/uploads/"
            );
    }
}