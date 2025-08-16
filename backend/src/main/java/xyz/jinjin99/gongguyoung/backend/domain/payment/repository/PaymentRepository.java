package xyz.jinjin99.gongguyoung.backend.domain.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.jinjin99.gongguyoung.backend.domain.payment.entity.Payment;
import xyz.jinjin99.gongguyoung.backend.global.enums.PaymentMethod;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByMemberId(Long memberId);
    List<Payment> findByGroupPurchaseId(Long groupPurchaseId);
    List<Payment> findByMethod(PaymentMethod method);
}