package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("ManagerClient getOrCreate 방식 테스트")
class ManagerClientSpringTest {

    @Autowired
    private ManagerClient managerClient;
    
    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(managerClient, "API_KEY", null);
        ReflectionTestUtils.setField(managerClient, "apiKeyTimestamp", null);
    }

    @Test
    @DisplayName("첫 번째 호출 시 API Key 생성 테스트")
    void testFirstCallCreatesApiKey() {
        try {
            String apiKey = managerClient.getOrCreateApiKey();

            assertNotNull(apiKey, "API Key가 null이면 안됩니다");
            assertFalse(apiKey.trim().isEmpty(), "API Key가 비어있으면 안됩니다");
            assertEquals(apiKey, managerClient.getOrCreateApiKey(), "캐시된 API Key가 일치해야 합니다");
            
        } catch (Exception e) {
            e.printStackTrace();
            fail("API 호출이 실패했습니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("24시간 이내 재호출 시 캐시된 API Key 반환 테스트")
    void testApiKeyCaching() {
        try {
            String firstApiKey = managerClient.getOrCreateApiKey();
            Thread.sleep(100); // 짧은 대기
            String secondApiKey = managerClient.getOrCreateApiKey();

            assertNotNull(firstApiKey, "첫 번째 API Key가 null이면 안됩니다");
            assertNotNull(secondApiKey, "두 번째 API Key가 null이면 안됩니다");
            assertEquals(firstApiKey, secondApiKey, "24시간 이내에는 같은 API Key를 반환해야 합니다");
            
        } catch (Exception e) {
            e.printStackTrace();
            fail("캐싱 테스트가 실패했습니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("만료된 API Key 재발급 테스트")
    void testExpiredApiKeyReissue() {
        try {
            // 첫 번째 API Key 생성
            String firstApiKey = managerClient.getOrCreateApiKey();
            assertNotNull(firstApiKey);
            
            // 강제로 오래된 타임스탬프 설정 (25시간 전)
            java.time.LocalDateTime expiredTime = java.time.LocalDateTime.now().minusHours(25);
            ReflectionTestUtils.setField(managerClient, "apiKeyTimestamp", expiredTime);
            
            // 다시 호출하면 새로운 API Key 발급
            String secondApiKey = managerClient.getOrCreateApiKey();
            assertNotNull(secondApiKey);
            
            log.info("첫 번째 API Key: {}", firstApiKey);
            log.info("두 번째 API Key: {}", secondApiKey);
            
        } catch (Exception e) {
            e.printStackTrace();
            fail("만료된 API Key 재발급 테스트가 실패했습니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("API_KEY가 null일 때 새로운 키 생성 테스트")
    void testNullApiKeyCreation() {
        try {
            // API_KEY를 명시적으로 null로 설정
            ReflectionTestUtils.setField(managerClient, "API_KEY", null);
            ReflectionTestUtils.setField(managerClient, "apiKeyTimestamp", null);
            
            String apiKey = managerClient.getOrCreateApiKey();
            
            assertNotNull(apiKey, "null API Key일 때 새로운 키가 생성되어야 합니다");
            assertFalse(apiKey.trim().isEmpty(), "생성된 API Key가 비어있으면 안됩니다");
            assertEquals(apiKey, managerClient.getOrCreateApiKey(), "캐시된 API Key가 일치해야 합니다");
            
        } catch (Exception e) {
            e.printStackTrace();
            fail("null API Key 생성 테스트가 실패했습니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("빈 문자열 API_KEY 처리 테스트")
    void testEmptyApiKeyHandling() {
        try {
            // API_KEY를 빈 문자열로 설정
            ReflectionTestUtils.setField(managerClient, "API_KEY", "");
            ReflectionTestUtils.setField(managerClient, "apiKeyTimestamp", java.time.LocalDateTime.now());
            
            String apiKey = managerClient.getOrCreateApiKey();
            
            assertNotNull(apiKey, "빈 API Key일 때 새로운 키가 생성되어야 합니다");
            assertFalse(apiKey.trim().isEmpty(), "생성된 API Key가 비어있으면 안됩니다");
            
        } catch (Exception e) {
            e.printStackTrace();
            fail("빈 문자열 API Key 처리 테스트가 실패했습니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("연속 호출 성능 테스트")
    void testConsecutiveCalls() {
        try {
            String firstApiKey = managerClient.getOrCreateApiKey();
            
            // 연속으로 5번 호출해서 모두 같은 키를 반환하는지 확인
            for (int i = 0; i < 5; i++) {
                String apiKey = managerClient.getOrCreateApiKey();
                assertEquals(firstApiKey, apiKey, 
                    String.format("%d번째 호출에서 캐시된 API Key와 다른 값을 반환했습니다", i + 1));
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            fail("연속 호출 테스트가 실패했습니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("타임스탬프 없는 유효한 API_KEY 처리 테스트")
    void testValidApiKeyWithoutTimestamp() {
        try {
            // API_KEY는 있지만 타임스탬프가 없는 경우
            ReflectionTestUtils.setField(managerClient, "API_KEY", "existing-api-key");
            ReflectionTestUtils.setField(managerClient, "apiKeyTimestamp", null);
            
            String apiKey = managerClient.getOrCreateApiKey();
            
            assertNotNull(apiKey, "타임스탬프 없는 API Key일 때 새로운 키가 생성되어야 합니다");
            assertFalse(apiKey.trim().isEmpty(), "생성된 API Key가 비어있으면 안됩니다");
            
        } catch (Exception e) {
            e.printStackTrace();
            fail("타임스탬프 없는 API Key 처리 테스트가 실패했습니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("Spring Bean이 제대로 주입되었는지 확인")
    void testManagerClientBeanInjection() {
        assertNotNull(managerClient, "ManagerClient Bean이 주입되어야 합니다");
    }
}