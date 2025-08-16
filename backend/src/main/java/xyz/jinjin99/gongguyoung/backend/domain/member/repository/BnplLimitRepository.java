package xyz.jinjin99.gongguyoung.backend.domain.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.BnplLimit;

public interface BnplLimitRepository extends JpaRepository<BnplLimit, Long> {
}