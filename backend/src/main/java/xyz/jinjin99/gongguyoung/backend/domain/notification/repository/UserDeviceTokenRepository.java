package xyz.jinjin99.gongguyoung.backend.domain.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import xyz.jinjin99.gongguyoung.backend.domain.notification.entity.UserDeviceToken;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserDeviceTokenRepository extends JpaRepository<UserDeviceToken, Long> {

    List<UserDeviceToken> findByMemberIdAndIsActiveTrue(Long memberId);
    
    Optional<UserDeviceToken> findByToken(String token);
    
    @Modifying
    @Query("UPDATE UserDeviceToken u SET u.isActive = false WHERE u.token = :token")
    void deactivateByToken(@Param("token") String token);
    
    @Modifying
    @Query("UPDATE UserDeviceToken u SET u.isActive = false WHERE u.lastUsedAt < :cutoffDate")
    void deactivateOldTokens(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    void deleteByMemberIdAndToken(Long memberId, String token);
    
    @Query("SELECT u.token FROM UserDeviceToken u WHERE u.member.id = :memberId AND u.isActive = true")
    List<String> findActiveTokensByMemberId(@Param("memberId") Long memberId);
}