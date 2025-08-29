package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchase;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.repository.GroupPurchaseRepository;
import xyz.jinjin99.gongguyoung.backend.domain.payment.entity.PaymentEvent;
import xyz.jinjin99.gongguyoung.backend.domain.payment.repository.PaymentRepository;
import xyz.jinjin99.gongguyoung.backend.domain.payment.service.PaymentService;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request.PaymentCancellationRequest;
import xyz.jinjin99.gongguyoung.backend.domain.notification.service.FCMService;
import xyz.jinjin99.gongguyoung.backend.global.exception.GroupPurchaseNotFoundException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Set;
import java.util.HashSet;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DelayedJobServiceImpl implements DelayedJobService {

    private static final String DELAYED_JOB_KEY = "delayed_jobs:group_purchase_expiry";

    private final RedisTemplate<String, Object> redisTemplate;
    private final GroupPurchaseRepository groupPurchaseRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    private final FCMService fcmService;

    @PostConstruct
    public void clearAllDelayedJobs() {
        redisTemplate.delete(DELAYED_JOB_KEY);
        log.info("모든 지연 작업이 삭제되었습니다: {}", DELAYED_JOB_KEY);
    }

    @Override
    public void scheduleGroupPurchaseExpiry(Long groupPurchaseId, LocalDateTime expiryTime) {
        long timestamp = expiryTime.atZone(ZoneId.of("Asia/Seoul")).toEpochSecond();

        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        zSetOps.add(DELAYED_JOB_KEY, groupPurchaseId.toString(), timestamp);

        log.info("Scheduled group purchase expiry: groupPurchaseId={}, expiryTime={}",
                groupPurchaseId, expiryTime);
    }

    @Override
    public Set<Object> getExpiredJobs() {
        long currentTimestamp = System.currentTimeMillis() / 1000;

        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        return zSetOps.rangeByScore(DELAYED_JOB_KEY, 0, currentTimestamp);
    }

    @Override
    public void removeJob(String groupPurchaseId) {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        zSetOps.remove(DELAYED_JOB_KEY, groupPurchaseId);

        log.debug("Removed expired job: groupPurchaseId={}", groupPurchaseId);
    }

    @Override
    @Transactional
    public void processExpiredGroupPurchase(String groupPurchaseId) {
        log.info("=== GROUP PURCHASE EXPIRED EVENT ===");
        log.info("Group Purchase ID: {}", groupPurchaseId);

        try {
            Long id = Long.parseLong(groupPurchaseId);
            GroupPurchase groupPurchase = groupPurchaseRepository.findById(id)
                    .orElseThrow(() -> new GroupPurchaseNotFoundException("공동구매가 존재하지 않습니다: " + groupPurchaseId));

            // 1. 상태 변경을 먼저 수행 (환불 처리와 완전히 분리)
            boolean isTargetAchieved = groupPurchase.isTargetAchieved();
            updateGroupPurchaseStatus(groupPurchase);
            
            log.info("공동구매 상태 변경 완료: {} -> {}", groupPurchaseId, 
                    isTargetAchieved ? "COMPLETE" : "CANCELLED");

            // 2. 목표 미달성 시 환불 처리 (별도 트랜잭션, 실패해도 상태는 이미 변경됨)
            if (!isTargetAchieved) {
                log.info("공동구매 목표 미달성 - 환불 처리 시작: {}", groupPurchaseId);
                processRefundSafely(groupPurchase);
            } else {
                log.info("공동구매 목표 달성 - 승인 처리 완료: {}", groupPurchaseId);
            }

            // 3. FCM 알림 전송
            sendExpiryNotificationToParticipants(groupPurchase, isTargetAchieved);
            
        } catch (NumberFormatException e) {
            log.error("잘못된 공동구매 ID 형식: {}", groupPurchaseId, e);
        } catch (Exception e) {
            log.error("공동구매 만료 처리 중 오류 발생: {}", groupPurchaseId, e);
            throw e;
        }

        log.info("=== GROUP PURCHASE EXPIRED EVENT COMPLETED ===");
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected void updateGroupPurchaseStatus(GroupPurchase groupPurchase) {
        groupPurchase.processExpiry();
        groupPurchaseRepository.save(groupPurchase);
    }
    
    private void processRefundSafely(GroupPurchase groupPurchase) {
        try {
            processRefundForExpiredGroupPurchase(groupPurchase);
            log.info("공동구매 환불 처리 완료: {}", groupPurchase.getId());
        } catch (Exception refundException) {
            log.error("환불 처리 실패하였으나 공동구매 상태 변경은 완료됨: {}", groupPurchase.getId(), refundException);
        }
    }

    private void processRefundForExpiredGroupPurchase(GroupPurchase groupPurchase) {
        List<PaymentEvent> payments = paymentRepository.findByGroupPurchaseId(groupPurchase.getId());

        for (PaymentEvent payment : payments) {
            try {
                PaymentCancellationRequest request = new PaymentCancellationRequest(
                        payment.getId(),
                        payment.getMember().getId());

                paymentService.refundPayment(request);
                log.info("결제 환불 완료 - PaymentEvent ID: {}, Member ID: {}",
                        payment.getId(), payment.getMember().getId());
            } catch (Exception e) {
                log.error("결제 환불 실패 - PaymentEvent ID: {}, Member ID: {}", payment.getId(), payment.getMember().getId(),
                        e);
                throw new RuntimeException(payment.getId() + " " + payment.getMember().getId());
            }
        }
    }
    
    private void sendExpiryNotificationToParticipants(GroupPurchase groupPurchase, boolean isTargetAchieved) {
        try {
            log.info("=== FCM 알림 전송 시작 ===");
            log.info("공동구매 ID: {}, 제목: '{}', 목표달성: {}", 
                    groupPurchase.getId(), groupPurchase.getTitle(), isTargetAchieved);
            
            // PaymentEvent를 통해 공동구매 참여자 조회
            List<PaymentEvent> payments = paymentRepository.findByGroupPurchaseId(groupPurchase.getId());
            
            if (payments.isEmpty()) {
                log.warn("공동구매 ID {}에 대한 결제 이벤트가 없습니다. FCM 알림을 전송하지 않습니다.", groupPurchase.getId());
                return;
            }
            
            log.info("결제 이벤트 발견: {} 건", payments.size());
            
            String title = isTargetAchieved ? "🎉 공동구매 성공!" : "⚠️ 공동구매 취소 안내";
            String message = isTargetAchieved 
                ? String.format("'%s' 공동구매가 목표를 달성하여 성공적으로 완료되었습니다!", groupPurchase.getTitle())
                : String.format("'%s' 공동구매가 목표 인원 미달로 취소되어 환불 처리됩니다.", groupPurchase.getTitle());
            
            log.info("FCM 알림 내용 - 제목: '{}', 메시지: '{}'", title, message);
            
            // 중복 회원 ID 제거를 위한 Set 사용
            Set<Long> memberIds = new HashSet<>();
            for (PaymentEvent payment : payments) {
                memberIds.add(payment.getMember().getId());
                log.debug("참여자 발견 - Member ID: {}, Payment ID: {}", 
                        payment.getMember().getId(), payment.getId());
            }
            
            log.info("고유 참가자 수: {} 명, Member IDs: {}", memberIds.size(), memberIds);
            
            int successCount = 0;
            int failedCount = 0;
            
            for (Long memberId : memberIds) {
                try {
                    log.info("FCM 알림 전송 시도 - Member ID: {}", memberId);
                    fcmService.sendNotificationToUser(memberId, title, message);
                    successCount++;
                    log.info("FCM 알림 전송 성공 - Member ID: {}", memberId);
                } catch (Exception e) {
                    failedCount++;
                    log.error("FCM 알림 전송 실패 - Member ID: {}, 오류: {}", memberId, e.getMessage());
                }
            }
            
            log.info("=== FCM 알림 전송 완료 ===");
            log.info("공동구매 ID: {}, 총 참가자: {}, 성공: {}, 실패: {}", 
                    groupPurchase.getId(), memberIds.size(), successCount, failedCount);
                    
        } catch (Exception e) {
            log.error("FCM 알림 전송 중 예상치 못한 오류 - 공동구매 ID: {}", groupPurchase.getId(), e);
        }
    }
}