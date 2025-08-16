package xyz.jinjin99.gongguyoung.backend.domain.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.KeywordAlert;

import java.util.List;

public interface KeywordAlertRepository extends JpaRepository<KeywordAlert, Long> {
    List<KeywordAlert> findByMemberId(Long memberId);
    List<KeywordAlert> findByKeywordContaining(String keyword);
}