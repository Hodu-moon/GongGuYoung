package xyz.jinjin99.gongguyoung.backend.domain.notification.service;

import java.util.List;

public interface UserDeviceTokenService {
    
    void saveOrUpdateToken(Long memberId, String token, String deviceType);
    
    void removeToken(Long memberId, String token);
    
    List<String> getActiveTokensByUserId(Long userId);
    
    void deactivateToken(String token);
    
    void cleanupOldTokens();
}