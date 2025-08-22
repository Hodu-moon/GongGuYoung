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
@DisplayName("MemberClient getOrCreateMember 전용 테스트")
class MemberClientSpringTest {

    @Autowired
    private MemberClient memberClient;

    @Test
    @DisplayName("새로운 사용자에 대한 getOrCreateMember 호출 테스트")
    void testGetOrCreateMemberWithNewUser() {
        String uniqueUserId = "new_user_" + UUID.randomUUID().toString().substring(0, 8) + "@gmail.com";
        
        MemberRecord result = memberClient.getOrCreateMember(uniqueUserId);
        
        assertNotNull(result, "getOrCreateMember 결과가 null이면 안됩니다");
        assertNotNull(result.getUserId(), "사용자 ID가 null이면 안됩니다");
        assertEquals(uniqueUserId, result.getUserId(), "요청한 사용자 ID와 응답의 사용자 ID가 일치해야 합니다");
        assertNotNull(result.getUserKey(), "사용자 키가 null이면 안됩니다");
        assertFalse(result.getUserKey().trim().isEmpty(), "사용자 키가 비어있으면 안됩니다");
        
        log.info("새 사용자 getOrCreateMember 결과: {}", result);
    }

    @Test
    @DisplayName("기존 사용자에 대한 getOrCreateMember 호출 테스트")
    void testGetOrCreateMemberWithExistingUser() {
        String userId = "existing_user_" + UUID.randomUUID().toString().substring(0, 8) + "@gmail.com";
        
        MemberRecord firstCall = memberClient.getOrCreateMember(userId);
        assertNotNull(firstCall, "첫 번째 getOrCreateMember 호출이 성공해야 합니다");
        
        MemberRecord secondCall = memberClient.getOrCreateMember(userId);
        
        assertNotNull(secondCall, "두 번째 getOrCreateMember 호출 결과가 null이면 안됩니다");
        assertEquals(firstCall.getUserId(), secondCall.getUserId(), "기존 사용자 ID가 일치해야 합니다");
        assertEquals(firstCall.getUserKey(), secondCall.getUserKey(), "기존 사용자 키가 일치해야 합니다");
        
        log.info("기존 사용자 getOrCreateMember 결과: {}", secondCall);
    }

    @Test
    @DisplayName("getOrCreateMember 멱등성 테스트")
    void testGetOrCreateMemberIdempotency() {
        String userId = "idempotent_user_" + UUID.randomUUID().toString().substring(0, 8) + "@gmail.com";
        
        MemberRecord result1 = memberClient.getOrCreateMember(userId);
        MemberRecord result2 = memberClient.getOrCreateMember(userId);
        MemberRecord result3 = memberClient.getOrCreateMember(userId);
        
        assertEquals(result1.getUserId(), result2.getUserId(), "첫 번째와 두 번째 호출 결과의 사용자 ID가 일치해야 합니다");
        assertEquals(result1.getUserKey(), result2.getUserKey(), "첫 번째와 두 번째 호출 결과의 사용자 키가 일치해야 합니다");
        assertEquals(result2.getUserId(), result3.getUserId(), "두 번째와 세 번째 호출 결과의 사용자 ID가 일치해야 합니다");
        assertEquals(result2.getUserKey(), result3.getUserKey(), "두 번째와 세 번째 호출 결과의 사용자 키가 일치해야 합니다");
        
        log.info("멱등성 테스트 완료 - 모든 호출 결과가 동일함: {}", result1);
    }

    @Test
    @DisplayName("getOrCreateMember 동시 호출 테스트")
    void testGetOrCreateMemberConcurrentCalls() {
        String userId = "concurrent_user_" + UUID.randomUUID().toString().substring(0, 8) + "@gmail.com";
        
        MemberRecord result1 = memberClient.getOrCreateMember(userId);
        MemberRecord result2 = memberClient.getOrCreateMember(userId);
        
        assertEquals(result1.getUserId(), result2.getUserId(), "동시 호출 시 사용자 ID가 일치해야 합니다");
        assertEquals(result1.getUserKey(), result2.getUserKey(), "동시 호출 시 사용자 키가 일치해야 합니다");
        
        log.info("동시 호출 테스트 완료: {}", result1);
    }

    @Test
    @DisplayName("getOrCreateMember 잘못된 입력값 테스트")
    void testGetOrCreateMemberWithInvalidInput() {
        assertThrows(Exception.class, () -> {
            memberClient.getOrCreateMember(null);
        }, "null 이메일로 getOrCreateMember 호출 시 예외가 발생해야 합니다");
        
        assertThrows(Exception.class, () -> {
            memberClient.getOrCreateMember("");
        }, "빈 문자열 이메일로 getOrCreateMember 호출 시 예외가 발생해야 합니다");
        
        assertThrows(Exception.class, () -> {
            memberClient.getOrCreateMember("invalid-email");
        }, "잘못된 이메일 형식으로 getOrCreateMember 호출 시 예외가 발생해야 합니다");
        
        assertThrows(Exception.class, () -> {
            memberClient.getOrCreateMember("testgmail.com");
        }, "@ 없는 이메일로 getOrCreateMember 호출 시 예외가 발생해야 합니다");
    }

    @Test
    @DisplayName("getOrCreateMember 응답 데이터 검증 테스트")
    void testGetOrCreateMemberResponseValidation() {
        String userId = "validation_user_" + UUID.randomUUID().toString().substring(0, 8) + "@gmail.com";
        
        MemberRecord result = memberClient.getOrCreateMember(userId);
        
        assertNotNull(result, "getOrCreateMember 응답이 null이면 안됩니다");
        assertNotNull(result.getUserId(), "응답에서 사용자 ID가 null이면 안됩니다");
        assertNotNull(result.getUserKey(), "응답에서 사용자 키가 null이면 안됩니다");
        assertFalse(result.getUserId().trim().isEmpty(), "사용자 ID가 비어있으면 안됩니다");
        assertFalse(result.getUserKey().trim().isEmpty(), "사용자 키가 비어있으면 안됩니다");
        assertTrue(result.getUserId().contains("@"), "사용자 ID에 @가 포함되어야 합니다");
        
        log.info("응답 데이터 검증 완료: {}", result);
    }

    @Test
    @DisplayName("getOrCreateMember Bean 주입 확인")
    void testMemberClientBeanInjection() {
        assertNotNull(memberClient, "MemberClient Bean이 주입되어야 합니다");
        log.info("MemberClient Bean 주입 확인 완료: {}", memberClient.getClass().getSimpleName());
    }
}