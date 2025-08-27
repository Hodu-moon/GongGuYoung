package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchase;
import xyz.jinjin99.gongguyoung.backend.global.enums.GroupPurchaseStatus;

import java.util.List;

public interface GroupPurchaseRepository extends JpaRepository<GroupPurchase, Long> {
    List<GroupPurchase> findByStatus(GroupPurchaseStatus status);
    List<GroupPurchase> findByProductId(Long productId);

    /**
     * 특정 회원이 결제한 모든 공동구매를 조회합니다.
     *
     * @param memberId 조회할 회원의 ID
     * @return 해당 회원이 한 번이라도 결제한 공동구매 목록 (중복 제거됨)
     */
    @Query("SELECT DISTINCT p.groupPurchase FROM PaymentEvent p WHERE p.member.id = :memberId")
    List<GroupPurchase> findByMemberId(Long memberId);
}