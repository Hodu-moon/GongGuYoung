package xyz.jinjin99.gongguyoung.backend.domain.notification.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FCMServiceImpl implements FCMService {

    private final UserDeviceTokenService userDeviceTokenService;

    @Override
    public void sendNotificationToUser(Long userId, String title, String message) {
        try {
            List<String> tokens = userDeviceTokenService.getActiveTokensByUserId(userId);
            
            if (tokens.isEmpty()) {
                log.warn("No FCM tokens found for user: {}", userId);
                return;
            }
            
            sendNotificationToMultipleTokens(tokens, title, message);
        } catch (Exception e) {
            log.error("Failed to send notification to user {}: {}", userId, e.getMessage(), e);
        }
    }

    @Override
    public void sendNotificationToToken(String token, String title, String message) {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                log.warn("Firebase is not initialized. FCM notification not sent.");
                return;
            }

            Message fcmMessage = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(message)
                            .build())
                    .putData("click_action", "FLUTTER_NOTIFICATION_CLICK")
                    .build();

            String response = FirebaseMessaging.getInstance().send(fcmMessage);
            log.info("FCM notification sent successfully to token {}: {}", maskToken(token), response);
            
        } catch (FirebaseMessagingException e) {
            if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                log.warn("FCM token is invalid/unregistered: {}", maskToken(token));
                userDeviceTokenService.deactivateToken(token);
            } else {
                log.error("Failed to send FCM notification to token {}: {}", maskToken(token), e.getMessage(), e);
            }
        } catch (Exception e) {
            log.error("Unexpected error sending FCM notification: {}", e.getMessage(), e);
        }
    }

    @Override
    public void sendNotificationToMultipleTokens(List<String> tokens, String title, String message) {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                log.warn("Firebase is not initialized. FCM notification not sent.");
                return;
            }

            if (tokens.isEmpty()) {
                log.warn("No tokens provided for notification");
                return;
            }

            int successCount = 0;
            int failureCount = 0;

            // Send individual messages instead of using batch/multicast
            for (String token : tokens) {
                try {
                    Message fcmMessage = Message.builder()
                            .setToken(token)
                            .setNotification(Notification.builder()
                                    .setTitle(title)
                                    .setBody(message)
                                    .build())
                            .putData("click_action", "FLUTTER_NOTIFICATION_CLICK")
                            .build();

                    String response = FirebaseMessaging.getInstance().send(fcmMessage);
                    log.info("FCM notification sent successfully to token {}: {}", maskToken(token), response);
                    successCount++;
                    
                } catch (FirebaseMessagingException e) {
                    failureCount++;
                    if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                        log.warn("FCM token is invalid/unregistered: {}", maskToken(token));
                        userDeviceTokenService.deactivateToken(token);
                    } else {
                        log.error("Failed to send FCM notification to token {}: {}", 
                                maskToken(token), e.getMessage());
                    }
                } catch (Exception e) {
                    failureCount++;
                    log.error("Unexpected error sending FCM notification to token {}: {}", 
                            maskToken(token), e.getMessage());
                }
            }
            
            log.info("FCM individual notifications sent: {} successful, {} failed", 
                    successCount, failureCount);
            
        } catch (Exception e) {
            log.error("Failed to send FCM notifications: {}", e.getMessage(), e);
        }
    }

    @Override
    public void sendNotificationToTopic(String topic, String title, String message) {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                log.warn("Firebase is not initialized. FCM notification not sent.");
                return;
            }

            Message fcmMessage = Message.builder()
                    .setTopic(topic)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(message)
                            .build())
                    .putData("click_action", "FLUTTER_NOTIFICATION_CLICK")
                    .build();

            String response = FirebaseMessaging.getInstance().send(fcmMessage);
            log.info("FCM topic notification sent successfully to topic {}: {}", topic, response);
            
        } catch (Exception e) {
            log.error("Failed to send FCM topic notification to {}: {}", topic, e.getMessage(), e);
        }
    }
    
    private String maskToken(String token) {
        if (token == null || token.length() < 8) {
            return "***";
        }
        return token.substring(0, 4) + "***" + token.substring(token.length() - 4);
    }
}