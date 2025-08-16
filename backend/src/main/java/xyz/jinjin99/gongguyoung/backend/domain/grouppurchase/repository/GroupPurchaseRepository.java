package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchase;
import xyz.jinjin99.gongguyoung.backend.global.enums.GroupPurchaseStatus;

import java.util.List;

public interface GroupPurchaseRepository extends JpaRepository<GroupPurchase, Long> {
    List<GroupPurchase> findByStatus(GroupPurchaseStatus status);
    List<GroupPurchase> findByProductId(Long productId);
}