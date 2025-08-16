package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchaseAccount;

import java.util.Optional;

public interface GroupPurchaseAccountRepository extends JpaRepository<GroupPurchaseAccount, Long> {
    Optional<GroupPurchaseAccount> findByGroupPurchaseId(Long groupPurchaseId);
}