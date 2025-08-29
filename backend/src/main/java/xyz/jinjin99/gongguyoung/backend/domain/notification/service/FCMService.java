package xyz.jinjin99.gongguyoung.backend.domain.notification.service;

import java.util.List;

public interface FCMService {
    
    void sendNotificationToUser(Long userId, String title, String message);
    
    void sendNotificationToToken(String token, String title, String message);
    
    void sendNotificationToMultipleTokens(List<String> tokens, String title, String message);
    
    void sendNotificationToTopic(String topic, String title, String message);
}