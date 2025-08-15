package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootTest
@ActiveProfiles("local")
@DisplayName("ManagerClient Spring Bean 테스트")
class ManagerClientSpringTest {

    @Autowired
    private ManagerClient managerClient;

    @Test
    @DisplayName("실제 ManagerClient Bean을 사용한 API Key 재발급 테스트")
    void testRealApiKeyReissueWithSpringBean() {
        try {
            String apiKey = managerClient.reissuedApiKeyAndRegister();

            assertNotNull(apiKey, "API Key가 null이면 안됩니다");
            assertFalse(apiKey.trim().isEmpty(), "API Key가 비어있으면 안됩니다");
            
            assertEquals(apiKey, managerClient.getCachedApiKey(), "캐시된 API Key가 일치해야 합니다");
            
            log.info("Spring Bean을 통한 API Key 재발급 성공");
            log.info("API Key: {}",apiKey);
            log.info("API Key 길이: {}", apiKey.length());
            
            assertTrue(apiKey.length() > 10, "API Key는 최소 10자 이상이어야 합니다");
            
        } catch (Exception e) {
            log.error("API 호출 실패: {}",e.getMessage());
            e.printStackTrace();
            fail("API 호출이 실패했습니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("여러 번 호출해도 새로운 API Key를 받을 수 있는지 테스트")
    void testMultipleApiKeyReissue() {
        try {
            String firstApiKey = managerClient.reissuedApiKeyAndRegister();
            Thread.sleep(1000);
            String secondApiKey = managerClient.reissuedApiKeyAndRegister();

            assertNotNull(firstApiKey, "첫 번째 API Key가 null이면 안됩니다");
            assertNotNull(secondApiKey, "두 번째 API Key가 null이면 안됩니다");
            
            log.info("첫 번째 API Key: " + firstApiKey);
            log.info("두 번째 API Key: " + secondApiKey);
            
            // 캐시가 최신값으로 업데이트되는지 확인
            assertEquals(secondApiKey, managerClient.getCachedApiKey(), "캐시가 최신 API Key로 업데이트되어야 합니다");
            
        } catch (Exception e) {
            log.error("다중 API 호출 테스트 실패: " + e.getMessage());
            e.printStackTrace();
            fail("다중 API 호출 테스트가 실패했습니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("Spring Bean이 제대로 주입되었는지 확인")
    void testManagerClientBeanInjection() {
        assertNotNull(managerClient, "ManagerClient Bean이 주입되어야 합니다");
        log.info("ManagerClient Bean 주입 성공: " + managerClient.getClass().getName());
    }
}