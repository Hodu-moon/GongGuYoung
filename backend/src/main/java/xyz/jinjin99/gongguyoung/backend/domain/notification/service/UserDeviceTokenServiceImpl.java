package xyz.jinjin99.gongguyoung.backend.domain.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;
import xyz.jinjin99.gongguyoung.backend.domain.member.repository.MemberRepository;
import xyz.jinjin99.gongguyoung.backend.domain.notification.entity.UserDeviceToken;
import xyz.jinjin99.gongguyoung.backend.domain.notification.repository.UserDeviceTokenRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserDeviceTokenServiceImpl implements UserDeviceTokenService {

    private final UserDeviceTokenRepository userDeviceTokenRepository;
    private final MemberRepository memberRepository;

    @Override
    public void saveOrUpdateToken(Long memberId, String token, String deviceType) {
        try {
            log.info("Attempting to save FCM token for member: {}", memberId);
            Member member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

            Optional<UserDeviceToken> existingToken = userDeviceTokenRepository.findByToken(token);
            
            if (existingToken.isPresent()) {
                UserDeviceToken userToken = existingToken.get();
                userToken.reactivate();
                log.debug("Updated existing FCM token for user: {}", memberId);
            } else {
                UserDeviceToken newToken = UserDeviceToken.builder()
                        .member(member)
                        .token(token)
                        .deviceType(deviceType)
                        .build();
                        
                userDeviceTokenRepository.save(newToken);
                log.info("Successfully saved new FCM token for user: {}", memberId);
            }
        } catch (Exception e) {
            log.error("Failed to save FCM token for user {}: {}", memberId, e.getMessage(), e);
        }
    }

    @Override
    public void removeToken(Long memberId, String token) {
        try {
            userDeviceTokenRepository.deleteByMemberIdAndToken(memberId, token);
            log.debug("Removed FCM token for user: {}", memberId);
        } catch (Exception e) {
            log.error("Failed to remove FCM token for user {}: {}", memberId, e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getActiveTokensByUserId(Long userId) {
        return userDeviceTokenRepository.findActiveTokensByMemberId(userId);
    }

    @Override
    public void deactivateToken(String token) {
        try {
            userDeviceTokenRepository.deactivateByToken(token);
            log.debug("Deactivated FCM token: {}", maskToken(token));
        } catch (Exception e) {
            log.error("Failed to deactivate FCM token {}: {}", maskToken(token), e.getMessage(), e);
        }
    }

    @Override
    public void cleanupOldTokens() {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
            userDeviceTokenRepository.deactivateOldTokens(cutoffDate);
            log.info("Cleaned up old FCM tokens older than {}", cutoffDate);
        } catch (Exception e) {
            log.error("Failed to cleanup old FCM tokens: {}", e.getMessage(), e);
        }
    }
    
    private String maskToken(String token) {
        if (token == null || token.length() < 8) {
            return "***";
        }
        return token.substring(0, 4) + "***" + token.substring(token.length() - 4);
    }
}