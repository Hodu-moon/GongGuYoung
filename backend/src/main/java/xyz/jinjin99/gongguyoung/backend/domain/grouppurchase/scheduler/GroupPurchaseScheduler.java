package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.service.DelayedJobService;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class GroupPurchaseScheduler {
    
    private final DelayedJobService delayedJobService;
    
    @Scheduled(fixedDelay = 10000) // 10초마다 실행
    public void processExpiredGroupPurchases() {
        log.debug("Checking for expired group purchases...");
        
        Set<Object> expiredJobs = delayedJobService.getExpiredJobs();
        
        if (expiredJobs.isEmpty()) {
            log.debug("No expired group purchases found");
            return;
        }
        
        log.info("Found {} expired group purchases", expiredJobs.size());
        
        for (Object job : expiredJobs) {
            String groupPurchaseId = job.toString();
            try {
                delayedJobService.processExpiredGroupPurchase(groupPurchaseId);
                delayedJobService.removeJob(groupPurchaseId);
            } catch (Exception e) {
                log.error("Error processing expired group purchase: groupPurchaseId={}", groupPurchaseId, e);
            }
        }
    }
}