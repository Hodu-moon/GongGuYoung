package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class DelayedJobServiceImpl implements DelayedJobService {

    private static final String DELAYED_JOB_KEY = "delayed_jobs:group_purchase_expiry";

    private final RedisTemplate<String, Object> redisTemplate;

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
    public void processExpiredGroupPurchase(String groupPurchaseId) {
        log.info("=== GROUP PURCHASE EXPIRED EVENT ===");
        log.info("Group Purchase ID: {}", groupPurchaseId);
        log.info("Expired at: {}", LocalDateTime.now());
        log.info("===================================");

        // 향후 여기에 실제 비즈니스 로직 추가 (이벤트 발행, 상태 변경 등)
        // 현재는 로그만 출력
    }
}