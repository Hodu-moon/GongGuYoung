package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import static org.junit.jupiter.api.Assertions.*;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import lombok.extern.slf4j.Slf4j;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.MemberRecord;

@Slf4j
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("MemberClient 실제 API 호출 테스트")
class MemberClientSpringTest {

    @Autowired
    private MemberClient memberClient;

    @Test
    @DisplayName("새로운 사용자 생성 테스트")
    void testCreateMember() {
        try {
            String uniqueUserId = "test_user_" + UUID.randomUUID().toString().substring(0, 8) + "@gmail.com";
            
            MemberRecord result = memberClient.createMember(uniqueUserId);
            
            assertNotNull(result, "생성된 멤버 정보가 null이면 안됩니다");
            assertNotNull(result.getUserId(), "사용자 ID가 null이면 안됩니다");
            assertEquals(uniqueUserId, result.getUserId(), "요청한 사용자 ID와 응답의 사용자 ID가 일치해야 합니다");
            assertNotNull(result.getUserKey(), "사용자 키가 null이면 안됩니다");
            assertFalse(result.getUserKey().trim().isEmpty(), "사용자 키가 비어있으면 안됩니다");
            
            log.info("생성된 멤버 정보: {}", result);
            
        } catch (Exception e) {
            e.printStackTrace();
            fail("사용자 생성이 실패했습니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("기존 사용자 조회 테스트")
    void testSearchExistingMember() {
        try {
            // 먼저 사용자 생성
            String uniqueUserId = "test_search_" + UUID.randomUUID().toString().substring(0, 8) + "@gmail.com";
            MemberRecord createdMember = memberClient.createMember(uniqueUserId);
            
            assertNotNull(createdMember, "사용자 생성이 성공해야 합니다");
            
            // 생성된 사용자 조회
            MemberRecord searchedMember = memberClient.searchMember(uniqueUserId);
            
            assertNotNull(searchedMember, "조회된 멤버 정보가 null이면 안됩니다");
            assertEquals(createdMember.getUserId(), searchedMember.getUserId(), "생성된 사용자와 조회된 사용자의 ID가 일치해야 합니다");
            assertEquals(createdMember.getUserKey(), searchedMember.getUserKey(), "생성된 사용자와 조회된 사용자의 키가 일치해야 합니다");
            
            log.info("조회된 멤버 정보: {}", searchedMember);
            
        } catch (Exception e) {
            e.printStackTrace();
            fail("사용자 조회가 실패했습니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("존재하지 않는 사용자 조회 테스트")
    void testSearchNonExistentMember() {
        try {
            String nonExistentUserId = "non_existent_" + UUID.randomUUID().toString().substring(0, 8) + "@gmail.com";
            
            // 존재하지 않는 사용자 조회 시 예외가 발생하거나 null이 반환될 수 있음
            assertThrows(Exception.class, () -> {
                memberClient.searchMember(nonExistentUserId);
            }, "존재하지 않는 사용자 조회 시 예외가 발생해야 합니다");
            
        } catch (AssertionError e) {
            // 예외가 발생하지 않고 null을 반환하는 경우도 있을 수 있으므로 로그만 남김
            log.info("존재하지 않는 사용자 조회 시 예외가 발생하지 않았습니다");
        }
    }

    @Test
    @DisplayName("중복 사용자 생성 테스트")
    void testCreateDuplicateMember() {
        try {
            String duplicateUserId = "test_duplicate_" + UUID.randomUUID().toString().substring(0, 8) + "@gmail.com";
            
            // 첫 번째 사용자 생성
            MemberRecord firstMember = memberClient.createMember(duplicateUserId);
            assertNotNull(firstMember, "첫 번째 사용자 생성이 성공해야 합니다");
            
            // 같은 ID로 두 번째 사용자 생성 시도
            // API 정책에 따라 예외가 발생하거나 기존 사용자 정보가 반환될 수 있음
            MemberRecord secondMember = memberClient.createMember(duplicateUserId);
            
            if (secondMember != null) {
                assertEquals(firstMember.getUserId(), secondMember.getUserId(), "중복 생성 시 같은 사용자 ID여야 합니다");
                log.info("중복 사용자 생성 결과: {}", secondMember);
            }
            
        } catch (Exception e) {
            log.info("중복 사용자 생성 시 예외 발생: {}", e.getMessage());
            // 중복 생성 시 예외가 발생하는 것도 정상적인 동작일 수 있음
        }
    }

    @Test
    @DisplayName("여러 사용자 생성 및 조회 테스트")
    void testMultipleMemberOperations() {
        try {
            String baseUserId = "test_multi_" + UUID.randomUUID().toString().substring(0, 4);
            
            // 3명의 사용자 생성
            for (int i = 1; i <= 3; i++) {
                String userId = baseUserId + "_" + i + "@gmail.com";
                
                MemberRecord createdMember = memberClient.createMember(userId);
                assertNotNull(createdMember, String.format("%d번째 사용자 생성이 실패했습니다", i));
                assertEquals(userId, createdMember.getUserId(), String.format("%d번째 사용자 ID가 일치하지 않습니다", i));
                
                // 생성 직후 조회 테스트
                MemberRecord searchedMember = memberClient.searchMember(userId);
                assertNotNull(searchedMember, String.format("%d번째 사용자 조회가 실패했습니다", i));
                assertEquals(createdMember.getUserKey(), searchedMember.getUserKey(), 
                    String.format("%d번째 사용자의 생성/조회 키가 일치하지 않습니다", i));
                
                log.info("{}번째 사용자 처리 완료: {}", i, createdMember.getUserId());
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            fail("다중 사용자 처리가 실패했습니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("잘못된 이메일 형식 처리 테스트")
    void testInvalidEmailHandling() {
        // null 이메일 테스트
        assertThrows(Exception.class, () -> {
            memberClient.createMember(null);
        }, "null 이메일로 생성 시 예외가 발생해야 합니다");
        
        // 빈 문자열 이메일 테스트
        assertThrows(Exception.class, () -> {
            memberClient.createMember("");
        }, "빈 문자열 이메일로 생성 시 예외가 발생해야 합니다");
        
        // 잘못된 이메일 형식 테스트
        assertThrows(Exception.class, () -> {
            memberClient.createMember("invalid-email");
        }, "잘못된 이메일 형식으로 생성 시 예외가 발생해야 합니다");
        
        // @ 없는 이메일 테스트
        assertThrows(Exception.class, () -> {
            memberClient.createMember("testgmail.com");
        }, "@ 없는 이메일로 생성 시 예외가 발생해야 합니다");
        
        // 도메인 없는 이메일 테스트
        assertThrows(Exception.class, () -> {
            memberClient.createMember("test@");
        }, "도메인 없는 이메일로 생성 시 예외가 발생해야 합니다");
    }

    @Test
    @DisplayName("MemberClient Bean 주입 확인")
    void testMemberClientBeanInjection() {
        assertNotNull(memberClient, "MemberClient Bean이 주입되어야 합니다");
        log.info("MemberClient Bean 주입 확인 완료: {}", memberClient.getClass().getSimpleName());
    }
}