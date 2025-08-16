package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchaseParticipant;

import java.util.List;

public interface GroupPurchaseParticipantRepository extends JpaRepository<GroupPurchaseParticipant, Long> {
    List<GroupPurchaseParticipant> findByGroupPurchaseId(Long groupPurchaseId);
    List<GroupPurchaseParticipant> findByMemberId(Long memberId);
    boolean existsByMemberIdAndGroupPurchaseId(Long memberId, Long groupPurchaseId);
}