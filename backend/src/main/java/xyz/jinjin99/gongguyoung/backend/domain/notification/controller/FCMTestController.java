package xyz.jinjin99.gongguyoung.backend.domain.notification.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.jinjin99.gongguyoung.backend.domain.notification.dto.request.FCMTestRequest;
import xyz.jinjin99.gongguyoung.backend.domain.notification.service.FCMService;
import xyz.jinjin99.gongguyoung.backend.domain.notification.service.UserDeviceTokenService;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.service.DelayedJobService;

@Slf4j
@RestController
@RequestMapping("/api/fcm")
@RequiredArgsConstructor
public class FCMTestController {

    private final FCMService fcmService;
    private final UserDeviceTokenService userDeviceTokenService;
    private final DelayedJobService delayedJobService;

    @PostMapping("/test")
    public ResponseEntity<String> sendTestNotification(@RequestBody FCMTestRequest request) {
        try {
            log.info("Sending test FCM notification to user: {}", request.getMemberId());
            fcmService.sendNotificationToUser(
                request.getMemberId(), 
                request.getTitle(), 
                request.getMessage()
            );
            
            return ResponseEntity.ok("FCM notification sent successfully to user " + request.getMemberId());
        } catch (Exception e) {
            log.error("Failed to send test FCM notification: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body("Failed to send FCM notification: " + e.getMessage());
        }
    }

    @PostMapping("/test/topic")
    public ResponseEntity<String> sendTopicNotification(@RequestBody FCMTestRequest request) {
        try {
            String topic = "all_users"; // 기본 토픽
            log.info("Sending test FCM topic notification to topic: {}", topic);
            fcmService.sendNotificationToTopic(topic, request.getTitle(), request.getMessage());
            
            return ResponseEntity.ok("FCM topic notification sent successfully to topic: " + topic);
        } catch (Exception e) {
            log.error("Failed to send test FCM topic notification: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body("Failed to send FCM topic notification: " + e.getMessage());
        }
    }

    @GetMapping("/tokens/{memberId}")
    public ResponseEntity<String> getTokensForUser(@PathVariable Long memberId) {
        try {
            var tokens = userDeviceTokenService.getActiveTokensByUserId(memberId);
            return ResponseEntity.ok(String.format("Found %d tokens for user %d: %s", 
                tokens.size(), memberId, tokens.toString()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Failed to get tokens: " + e.getMessage());
        }
    }

    @PostMapping("/test/group-purchase-expiry/{groupPurchaseId}")
    public ResponseEntity<String> testGroupPurchaseExpiry(@PathVariable String groupPurchaseId) {
        try {
            log.info("=== 그룹 구매 만료 테스트 시작 ===");
            log.info("Group Purchase ID: {}", groupPurchaseId);
            
            delayedJobService.processExpiredGroupPurchase(groupPurchaseId);
            
            log.info("=== 그룹 구매 만료 테스트 완료 ===");
            
            return ResponseEntity.ok("그룹 구매 만료 처리가 완료되었습니다. Group Purchase ID: " + groupPurchaseId);
        } catch (Exception e) {
            log.error("그룹 구매 만료 테스트 실패 - Group Purchase ID: {}", groupPurchaseId, e);
            return ResponseEntity.internalServerError()
                .body("그룹 구매 만료 테스트 실패: " + e.getMessage());
        }
    }
}