package xyz.jinjin99.gongguyoung.backend.global.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Configuration
public class FCMConfig {

    @Value("${fcm.service-account-key-path:firebase-service-account.json}")
    private String serviceAccountKeyPath;

    @PostConstruct
    public void initFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                ClassPathResource resource = new ClassPathResource(serviceAccountKeyPath);
                
                if (!resource.exists()) {
                    log.warn("Firebase service account key file not found: {}. FCM will be disabled.", serviceAccountKeyPath);
                    return;
                }

                try (InputStream serviceAccount = resource.getInputStream()) {
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();

                    FirebaseApp.initializeApp(options);
                    log.info("Firebase FCM initialized successfully");
                }
            }
        } catch (IOException e) {
            log.error("Failed to initialize Firebase FCM: {}", e.getMessage(), e);
        }
    }
}