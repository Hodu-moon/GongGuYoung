package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.request.CreateGroupPurchaseRequest;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.response.GroupPurchaseResponse;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DisplayName("GroupPurchaseController 통합 테스트")
class GroupPurchaseControllerTest {

        @LocalServerPort
        private int port;

        @Autowired
        private TestRestTemplate restTemplate;

        private String baseUrl;

        @BeforeEach
        void setUp() {
                baseUrl = "http://localhost:" + port + "/api/v1/group-purchase";
        }

        private HttpHeaders createHeaders() {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                return headers;
        }

        @Test
        @DisplayName("공동구매 생성 API 테스트")
        void createGroupPurchase() {
                CreateGroupPurchaseRequest request = new CreateGroupPurchaseRequest(
                                "테스트 공동구매",
                                "테스트 공동구매 설명",
                                1, // 첫 번째 상품 사용
                                LocalDateTime.now().plusDays(7),
                                10,
                                (long) (350000L * 0.9));

                HttpEntity<CreateGroupPurchaseRequest> entity = new HttpEntity<>(request, createHeaders());

                ResponseEntity<GroupPurchaseResponse> response = restTemplate.exchange(
                                baseUrl,
                                HttpMethod.POST,
                                entity,
                                GroupPurchaseResponse.class);

                assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                assertThat(response.getBody()).isNotNull();

                var data = response.getBody();
                assertThat(data).isNotNull();

                assertThat(data.getTitle()).isEqualTo("테스트 공동구매");
                assertThat(data.getContext()).isEqualTo("테스트 공동구매 설명");
                assertThat(data.getTargetCount()).isEqualTo(10);
                assertThat(data.getCurrentCount()).isEqualTo(0);
                assertThat(data.getStatus().toString()).isEqualTo("WAITING");
                assertThat(data.getProductId()).isEqualTo(1L);
                assertThat(data.getId()).isNotNull();
                assertThat(data.getCreatedAt()).isNotNull();
                assertThat(data.getEndAt()).isNotNull();
        }

        @Test
        @DisplayName("존재하지 않는 상품으로 공동구매 생성 시 실패 테스트")
        void createGroupPurchaseWithNonExistentProduct() {
                CreateGroupPurchaseRequest request = new CreateGroupPurchaseRequest(
                                "테스트 공동구매",
                                "테스트 공동구매 설명",
                                999999,
                                LocalDateTime.now().plusDays(7),
                                10,
                                (long) (350000L * 0.9));

                HttpEntity<CreateGroupPurchaseRequest> entity = new HttpEntity<>(request, createHeaders());

                ResponseEntity<String> response = restTemplate.exchange(
                                baseUrl,
                                HttpMethod.POST,
                                entity,
                                String.class);

                assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }

        @Test
        @DisplayName("전체 공동구매 조회 API 테스트")
        void getAllGroupPurchases() {
                ResponseEntity<List<GroupPurchaseResponse>> response = restTemplate.exchange(
                                baseUrl,
                                HttpMethod.GET,
                                null,
                                new ParameterizedTypeReference<List<GroupPurchaseResponse>>() {
                                });

                assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                assertThat(response.getBody()).isNotNull();
                assertThat(response.getBody()).isInstanceOf(List.class);
        }

        @Test
        @DisplayName("공동구매 생성 후 전체 조회 테스트")
        void createAndGetAllGroupPurchases() {
                // 공동구매 생성
                CreateGroupPurchaseRequest request = new CreateGroupPurchaseRequest(
                                "통합 테스트 공동구매",
                                "통합 테스트 설명",
                                1,
                                LocalDateTime.now().plusDays(7),
                                5,
                                (long) (350000L * 0.9));

                HttpEntity<CreateGroupPurchaseRequest> entity = new HttpEntity<>(request, createHeaders());

                ResponseEntity<GroupPurchaseResponse> createResponse = restTemplate.exchange(
                                baseUrl,
                                HttpMethod.POST,
                                entity,
                                GroupPurchaseResponse.class);

                assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

                // 전체 조회
                ResponseEntity<List<GroupPurchaseResponse>> getAllResponse = restTemplate.exchange(
                                baseUrl,
                                HttpMethod.GET,
                                null,
                                new ParameterizedTypeReference<List<GroupPurchaseResponse>>() {
                                });

                assertThat(getAllResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
                assertThat(getAllResponse.getBody()).isNotNull();
                assertThat(getAllResponse.getBody().size()).isGreaterThan(0);

                // 생성한 공동구매가 목록에 있는지 확인
                boolean found = getAllResponse.getBody().stream()
                                .anyMatch(gp -> "통합 테스트 공동구매".equals(gp.getTitle()));
                assertThat(found).isTrue();
        }
}