package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchase;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.repository.GroupPurchaseRepository;
import xyz.jinjin99.gongguyoung.backend.domain.payment.entity.PaymentEvent;
import xyz.jinjin99.gongguyoung.backend.domain.payment.repository.PaymentRepository;
import xyz.jinjin99.gongguyoung.backend.domain.payment.service.PaymentService;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request.PaymentCancellationRequest;
import xyz.jinjin99.gongguyoung.backend.global.exception.GroupPurchaseNotFoundException;
import xyz.jinjin99.gongguyoung.backend.global.exception.PaymentRefundException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Set;
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
        log.info("Expired at: {}", LocalDateTime.now());
        log.info("===================================");

        try {
            Long id = Long.parseLong(groupPurchaseId);
            GroupPurchase groupPurchase = groupPurchaseRepository.findById(id)
                    .orElseThrow(() -> new GroupPurchaseNotFoundException("공동구매가 존재하지 않습니다: " + groupPurchaseId));

            if (groupPurchase.isTargetAchieved()) {
                log.info("공동구매 목표 달성 - 승인 처리: {}", groupPurchaseId);
            } else {
                log.info("공동구매 목표 미달성 - 환불 처리 시작: {}", groupPurchaseId);
                processRefundForExpiredGroupPurchase(groupPurchase);
                log.info("공동구매 환불 처리 완료: {}", groupPurchaseId);
            }

            groupPurchase.processExpiry();
            groupPurchaseRepository.save(groupPurchase);
        } catch (NumberFormatException e) {
            log.error("잘못된 공동구매 ID 형식: {}", groupPurchaseId, e);
        } catch (Exception e) {
            log.error("공동구매 만료 처리 중 오류 발생: {}", groupPurchaseId, e);
            throw e;
        }

        log.info("=== GROUP PURCHASE EXPIRED EVENT COMPLETED ===");
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
                log.error("결제 환불 실패 - PaymentEvent ID: {}, Member ID: {}",
                        payment.getId(), payment.getMember().getId(), e);
                throw new PaymentRefundException(payment.getId(), payment.getMember().getId());
            }
        }
    }
}