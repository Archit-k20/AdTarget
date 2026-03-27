package com.example.adapi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")  // Use test-specific configuration
class AdapiApplicationTests {

    @Test
    void contextLoads() {
    }
}
