package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.service;

import java.time.LocalDateTime;
import java.util.Set;

public interface DelayedJobService {
    
    void scheduleGroupPurchaseExpiry(Long groupPurchaseId, LocalDateTime expiryTime);
    
    Set<Object> getExpiredJobs();
    
    void removeJob(String groupPurchaseId);
    
    void processExpiredGroupPurchase(String groupPurchaseId);
}