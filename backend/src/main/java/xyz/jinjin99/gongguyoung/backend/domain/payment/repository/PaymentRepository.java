package xyz.jinjin99.gongguyoung.backend.domain.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.jinjin99.gongguyoung.backend.domain.payment.entity.PaymentEvent;
import xyz.jinjin99.gongguyoung.backend.global.enums.PaymentMethod;

import java.util.List;

public interface PaymentRepository extends JpaRepository<PaymentEvent, Long> {
    List<PaymentEvent> findByMemberId(Long memberId);
    List<PaymentEvent> findByGroupPurchaseId(Long groupPurchaseId);
    List<PaymentEvent> findByMethod(PaymentMethod method);
}