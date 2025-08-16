package xyz.jinjin99.gongguyoung.backend.domain.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
    boolean existsByEmail(String email);
}