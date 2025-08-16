package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import lombok.extern.slf4j.Slf4j;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.CurrencyRecord;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.InquireBankCodesResponse;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.InquireBankCurrencyResponse;

@Slf4j
@SpringBootTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("CommonClient 마스터 데이터 조회 테스트")
class CommonInfoClientSpringTest {

    @Autowired
    private CommonInfoClient commonClient;
    
    @Autowired
    private ManagerClient managerClient;
    
    // 테스트에서 확인할 주요 은행들
    private static final String[] MAJOR_BANKS = {
        "신한", "국민", "하나", "우리", "기업", 
        "농협", "수협", "대구", "부산", "광주"
    };
    
    // 테스트에서 확인할 주요 통화들
    private static final String[] MAJOR_CURRENCIES = {
        "KRW", "USD", "EUR", "JPY", "CNY"
    };

    // ============= 기본 기능 테스트 =============
    
    @Test
    @Order(1)
    @DisplayName("은행 코드 조회 기본 테스트")
    void testInquireBankCodes() {
        try {
            InquireBankCodesResponse response = commonClient.inquireBankCodes();
            
            assertNotNull(response, "응답이 null이면 안됩니다");
            assertNotNull(response.getHeader(), "응답 헤더가 null이면 안됩니다");
            
            log.info("은행 코드 조회 응답: {}", response.getHeader().getResponseCode());
            log.info("은행 코드 조회 메시지: {}", response.getHeader().getResponseMessage());
            
            String responseCode = response.getHeader().getResponseCode();
            assertNotNull(responseCode, "응답 코드가 null이면 안됩니다");
            
            // 성공 응답인 경우 데이터 검증
            if ("H0000".equals(responseCode)) {
                assertNotNull(response.getRecords(), "은행 목록이 null이면 안됩니다");
                assertFalse(response.getRecords().isEmpty(), "은행 목록이 비어있으면 안됩니다");
                
                log.info("조회된 은행 수: {}", response.getRecords().size());
                
                // 첫 번째 은행 데이터 검증
                InquireBankCodesResponse.BankRecord firstBank = response.getRecords().get(0);
                assertNotNull(firstBank.getBankCode(), "은행 코드가 null이면 안됩니다");
                assertNotNull(firstBank.getBankName(), "은행명이 null이면 안됩니다");
                assertFalse(firstBank.getBankCode().trim().isEmpty(), "은행 코드가 비어있으면 안됩니다");
                assertFalse(firstBank.getBankName().trim().isEmpty(), "은행명이 비어있으면 안됩니다");
                
                log.info("첫 번째 은행: {} - {}", firstBank.getBankCode(), firstBank.getBankName());
                
                // 몇 개 은행 로깅
                response.getRecords().stream()
                    .limit(5)
                    .forEach(bank -> log.info("은행: {} - {}", bank.getBankCode(), bank.getBankName()));
            } else {
                log.warn("은행 코드 조회 실패: {} - {}", responseCode, response.getHeader().getResponseMessage());
            }
            
        } catch (Exception e) {
            log.error("은행 코드 조회 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("은행 코드 조회 테스트 실패: " + e.getMessage());
        }
    }
    
    @Test
    @Order(2)
    @DisplayName("통화 정보 조회 기본 테스트")
    void testInquireBankCurrency() {
        try {
            InquireBankCurrencyResponse response = commonClient.inquireBankCurrency();
            
            assertNotNull(response, "응답이 null이면 안됩니다");
            assertNotNull(response.getHeader(), "응답 헤더가 null이면 안됩니다");
            
            log.info("통화 정보 조회 응답: {}", response.getHeader().getResponseCode());
            log.info("통화 정보 조회 메시지: {}", response.getHeader().getResponseMessage());
            
            String responseCode = response.getHeader().getResponseCode();
            assertNotNull(responseCode, "응답 코드가 null이면 안됩니다");
            
            // 성공 응답인 경우 데이터 검증
            if ("H0000".equals(responseCode)) {
                assertNotNull(response.getRecords(), "통화 목록이 null이면 안됩니다");
                assertFalse(response.getRecords().isEmpty(), "통화 목록이 비어있으면 안됩니다");
                
                log.info("조회된 통화 수: {}", response.getRecords().size());
                
                // 첫 번째 통화 데이터 검증
                CurrencyRecord firstCurrency = response.getRecords().get(0);
                assertNotNull(firstCurrency.getCurrency(), "통화 코드가 null이면 안됩니다");
                assertNotNull(firstCurrency.getCurrencyName(), "통화명이 null이면 안됩니다");
                assertFalse(firstCurrency.getCurrency().trim().isEmpty(), "통화 코드가 비어있으면 안됩니다");
                assertFalse(firstCurrency.getCurrencyName().trim().isEmpty(), "통화명이 비어있으면 안됩니다");
                
                log.info("첫 번째 통화: {} - {}", firstCurrency.getCurrency(), firstCurrency.getCurrencyName());
                
                // 모든 통화 로깅
                response.getRecords().forEach(currency -> 
                    log.info("통화: {} - {}", currency.getCurrency(), currency.getCurrencyName()));
            } else {
                log.warn("통화 정보 조회 실패: {} - {}", responseCode, response.getHeader().getResponseMessage());
            }
            
        } catch (Exception e) {
            log.error("통화 정보 조회 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("통화 정보 조회 테스트 실패: " + e.getMessage());
        }
    }

    // ============= 응답 데이터 품질 검증 테스트 =============
    
    @Test
    @Order(3)
    @DisplayName("은행 데이터 품질 검증 테스트")
    void testBankCodesDataQuality() {
        try {
            InquireBankCodesResponse response = commonClient.inquireBankCodes();
            
            // 성공 응답인 경우만 검증
            if (!"H0000".equals(response.getHeader().getResponseCode())) {
                log.info("은행 코드 조회 실패로 데이터 품질 검증 스킵");
                return;
            }
            
            List<InquireBankCodesResponse.BankRecord> banks = response.getRecords();
            
            // 1. 중복 은행 코드 검증
            Set<String> bankCodes = banks.stream()
                .map(InquireBankCodesResponse.BankRecord::getBankCode)
                .collect(Collectors.toSet());
            assertEquals(banks.size(), bankCodes.size(), "중복된 은행 코드가 있으면 안됩니다");
            
            // 2. 빈 값 검증
            banks.forEach(bank -> {
                assertNotNull(bank.getBankCode(), "은행 코드가 null이면 안됩니다");
                assertNotNull(bank.getBankName(), "은행명이 null이면 안됩니다");
                assertFalse(bank.getBankCode().trim().isEmpty(), "은행 코드가 비어있으면 안됩니다");
                assertFalse(bank.getBankName().trim().isEmpty(), "은행명이 비어있으면 안됩니다");
            });
            
            // 3. 은행 코드 형식 검증 (숫자 3자리가 일반적)
            long validFormatCount = banks.stream()
                .filter(bank -> bank.getBankCode().matches("\\d{3}"))
                .count();
            
            log.info("3자리 숫자 형식 은행 코드 수: {} / {}", validFormatCount, banks.size());
            
            // 대부분의 은행 코드가 3자리 숫자 형식이어야 함
            assertTrue(validFormatCount > banks.size() * 0.8, 
                "대부분의 은행 코드가 3자리 숫자 형식이어야 합니다");
            
            log.info("은행 데이터 품질 검증 완료: 총 {}개 은행", banks.size());
            
        } catch (Exception e) {
            log.error("은행 데이터 품질 검증 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("은행 데이터 품질 검증 테스트 실패: " + e.getMessage());
        }
    }
    
    @Test
    @Order(4)
    @DisplayName("통화 데이터 품질 검증 테스트")
    void testCurrencyDataQuality() {
        try {
            InquireBankCurrencyResponse response = commonClient.inquireBankCurrency();
            
            // 성공 응답인 경우만 검증
            if (!"H0000".equals(response.getHeader().getResponseCode())) {
                log.info("통화 정보 조회 실패로 데이터 품질 검증 스킵");
                return;
            }
            
            List<CurrencyRecord> currencies = response.getRecords();
            
            // 1. 중복 통화 코드 검증
            Set<String> currencyCodes = currencies.stream()
                .map(CurrencyRecord::getCurrency)
                .collect(Collectors.toSet());
            assertEquals(currencies.size(), currencyCodes.size(), "중복된 통화 코드가 있으면 안됩니다");
            
            // 2. 빈 값 검증
            currencies.forEach(currency -> {
                assertNotNull(currency.getCurrency(), "통화 코드가 null이면 안됩니다");
                assertNotNull(currency.getCurrencyName(), "통화명이 null이면 안됩니다");
                assertFalse(currency.getCurrency().trim().isEmpty(), "통화 코드가 비어있으면 안됩니다");
                assertFalse(currency.getCurrencyName().trim().isEmpty(), "통화명이 비어있으면 안됩니다");
            });
            
            // 3. 통화 코드 형식 검증 (대문자 3자리가 일반적)
            long validFormatCount = currencies.stream()
                .filter(currency -> currency.getCurrency().matches("[A-Z]{3}"))
                .count();
            
            log.info("3자리 대문자 형식 통화 코드 수: {} / {}", validFormatCount, currencies.size());
            
            // 대부분의 통화 코드가 3자리 대문자 형식이어야 함
            assertTrue(validFormatCount > currencies.size() * 0.7, 
                "대부분의 통화 코드가 3자리 대문자 형식이어야 합니다");
            
            log.info("통화 데이터 품질 검증 완료: 총 {}개 통화", currencies.size());
            
        } catch (Exception e) {
            log.error("통화 데이터 품질 검증 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("통화 데이터 품질 검증 테스트 실패: " + e.getMessage());
        }
    }
    
    @Test
    @Order(5)
    @DisplayName("주요 은행 포함 확인 테스트")
    void testMajorBanksIncluded() {
        try {
            InquireBankCodesResponse response = commonClient.inquireBankCodes();
            
            // 성공 응답인 경우만 검증
            if (!"H0000".equals(response.getHeader().getResponseCode())) {
                log.info("은행 코드 조회 실패로 주요 은행 확인 스킵");
                return;
            }
            
            List<InquireBankCodesResponse.BankRecord> banks = response.getRecords();
            
            // 은행명에서 주요 은행들이 포함되어 있는지 확인
            Set<String> bankNames = banks.stream()
                .map(InquireBankCodesResponse.BankRecord::getBankName)
                .collect(Collectors.toSet());
            
            int foundMajorBanks = 0;
            for (String majorBank : MAJOR_BANKS) {
                boolean found = bankNames.stream()
                    .anyMatch(name -> name.contains(majorBank));
                if (found) {
                    foundMajorBanks++;
                    log.info("주요 은행 발견: {}", majorBank);
                } else {
                    log.warn("주요 은행 미발견: {}", majorBank);
                }
            }
            
            log.info("주요 은행 포함 수: {} / {}", foundMajorBanks, MAJOR_BANKS.length);
            
            // 최소한 절반 이상의 주요 은행이 포함되어야 함
            assertTrue(foundMajorBanks >= MAJOR_BANKS.length / 2, 
                "주요 은행들 중 절반 이상이 포함되어야 합니다");
            
        } catch (Exception e) {
            log.error("주요 은행 포함 확인 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("주요 은행 포함 확인 테스트 실패: " + e.getMessage());
        }
    }
    
    @Test
    @Order(6)
    @DisplayName("한국 원화(KRW) 통화 포함 확인 테스트")
    void testKoreanCurrencyIncluded() {
        try {
            InquireBankCurrencyResponse response = commonClient.inquireBankCurrency();
            
            // 성공 응답인 경우만 검증
            if (!"H0000".equals(response.getHeader().getResponseCode())) {
                log.info("통화 정보 조회 실패로 KRW 확인 스킵");
                return;
            }
            
            List<CurrencyRecord> currencies = response.getRecords();
            
            // KRW 통화 존재 확인
            boolean krwFound = currencies.stream()
                .anyMatch(currency -> "KRW".equals(currency.getCurrency()));
            
            if (krwFound) {
                log.info("KRW 통화 발견");
                CurrencyRecord krw = currencies.stream()
                    .filter(currency -> "KRW".equals(currency.getCurrency()))
                    .findFirst()
                    .orElse(null);
                if (krw != null) {
                    log.info("KRW 통화 정보: {} - {}", krw.getCurrency(), krw.getCurrencyName());
                }
            } else {
                log.warn("KRW 통화를 찾을 수 없습니다");
            }
            
            // 기타 주요 통화들 확인
            int foundMajorCurrencies = 0;
            for (String majorCurrency : MAJOR_CURRENCIES) {
                boolean found = currencies.stream()
                    .anyMatch(currency -> majorCurrency.equals(currency.getCurrency()));
                if (found) {
                    foundMajorCurrencies++;
                    log.info("주요 통화 발견: {}", majorCurrency);
                }
            }
            
            log.info("주요 통화 포함 수: {} / {}", foundMajorCurrencies, MAJOR_CURRENCIES.length);
            
            // 최소한 KRW는 포함되어야 함 (한국 금융API이므로)
            assertTrue(krwFound, "한국 원화(KRW)가 포함되어야 합니다");
            
        } catch (Exception e) {
            log.error("KRW 통화 확인 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("KRW 통화 확인 테스트 실패: " + e.getMessage());
        }
    }

    // ============= 성능 및 안정성 테스트 =============
    
    @Test
    @Order(7)
    @DisplayName("연속 호출 안정성 테스트")
    void testConsecutiveCalls() {
        try {
            InquireBankCodesResponse firstResponse = null;
            InquireBankCurrencyResponse firstCurrencyResponse = null;
            
            // 5회 연속 호출
            for (int i = 0; i < 5; i++) {
                log.info("{}번째 연속 호출 시작", i + 1);
                
                InquireBankCodesResponse bankResponse = commonClient.inquireBankCodes();
                InquireBankCurrencyResponse currencyResponse = commonClient.inquireBankCurrency();
                
                assertNotNull(bankResponse, "은행 코드 응답이 null이면 안됩니다");
                assertNotNull(currencyResponse, "통화 정보 응답이 null이면 안됩니다");
                
                if (i == 0) {
                    firstResponse = bankResponse;
                    firstCurrencyResponse = currencyResponse;
                } else {
                    // 응답 일관성 확인 (성공한 경우)
                    if ("H0000".equals(firstResponse.getHeader().getResponseCode()) && 
                        "H0000".equals(bankResponse.getHeader().getResponseCode())) {
                        assertEquals(firstResponse.getRecords().size(), bankResponse.getRecords().size(),
                            "연속 호출 시 은행 수가 일관되어야 합니다");
                    }
                    
                    if ("H0000".equals(firstCurrencyResponse.getHeader().getResponseCode()) && 
                        "H0000".equals(currencyResponse.getHeader().getResponseCode())) {
                        assertEquals(firstCurrencyResponse.getRecords().size(), currencyResponse.getRecords().size(),
                            "연속 호출 시 통화 수가 일관되어야 합니다");
                    }
                }
                
                // 잠시 대기
                Thread.sleep(100);
            }
            
            log.info("연속 호출 안정성 테스트 완료");
            
        } catch (Exception e) {
            log.error("연속 호출 테스트 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("연속 호출 안정성 테스트 실패: " + e.getMessage());
        }
    }
    
    @Test
    @Order(8)
    @DisplayName("동시 호출 안정성 테스트")
    void testConcurrentCalls() {
        ExecutorService executor = Executors.newFixedThreadPool(4);
        
        try {
            // 동시에 여러 스레드에서 API 호출
            CompletableFuture<InquireBankCodesResponse> bankFuture1 = 
                CompletableFuture.supplyAsync(() -> commonClient.inquireBankCodes(), executor);
            CompletableFuture<InquireBankCodesResponse> bankFuture2 = 
                CompletableFuture.supplyAsync(() -> commonClient.inquireBankCodes(), executor);
            CompletableFuture<InquireBankCurrencyResponse> currencyFuture1 = 
                CompletableFuture.supplyAsync(() -> commonClient.inquireBankCurrency(), executor);
            CompletableFuture<InquireBankCurrencyResponse> currencyFuture2 = 
                CompletableFuture.supplyAsync(() -> commonClient.inquireBankCurrency(), executor);
            
            // 모든 요청 완료 대기
            CompletableFuture.allOf(bankFuture1, bankFuture2, currencyFuture1, currencyFuture2)
                .get(30, TimeUnit.SECONDS);
            
            // 결과 검증
            InquireBankCodesResponse bank1 = bankFuture1.get();
            InquireBankCodesResponse bank2 = bankFuture2.get();
            InquireBankCurrencyResponse currency1 = currencyFuture1.get();
            InquireBankCurrencyResponse currency2 = currencyFuture2.get();
            
            assertNotNull(bank1, "첫 번째 은행 코드 응답이 null이면 안됩니다");
            assertNotNull(bank2, "두 번째 은행 코드 응답이 null이면 안됩니다");
            assertNotNull(currency1, "첫 번째 통화 정보 응답이 null이면 안됩니다");
            assertNotNull(currency2, "두 번째 통화 정보 응답이 null이면 안됩니다");
            
            // 응답 일관성 확인 (둘 다 성공한 경우)
            if ("H0000".equals(bank1.getHeader().getResponseCode()) && 
                "H0000".equals(bank2.getHeader().getResponseCode())) {
                assertEquals(bank1.getRecords().size(), bank2.getRecords().size(),
                    "동시 호출 시 은행 수가 일관되어야 합니다");
            }
            
            if ("H0000".equals(currency1.getHeader().getResponseCode()) && 
                "H0000".equals(currency2.getHeader().getResponseCode())) {
                assertEquals(currency1.getRecords().size(), currency2.getRecords().size(),
                    "동시 호출 시 통화 수가 일관되어야 합니다");
            }
            
            log.info("동시 호출 안정성 테스트 완료");
            
        } catch (Exception e) {
            log.error("동시 호출 테스트 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("동시 호출 안정성 테스트 실패: " + e.getMessage());
        } finally {
            executor.shutdown();
            try {
                if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }

    // ============= Bean 및 통합 테스트 =============
    
    @Test
    @Order(9)
    @DisplayName("Bean 주입 확인 테스트")
    void testBeanInjection() {
        assertNotNull(commonClient, "CommonClient Bean이 주입되어야 합니다");
        assertNotNull(managerClient, "ManagerClient Bean이 주입되어야 합니다");
        
        log.info("CommonClient Bean 주입 확인 완료: {}", commonClient.getClass().getSimpleName());
        log.info("ManagerClient Bean 주입 확인 완료: {}", managerClient.getClass().getSimpleName());
    }
    
    @Test
    @Order(10)
    @DisplayName("ManagerClient 연동 확인 테스트")
    void testManagerClientIntegration() {
        try {
            // ManagerClient를 통해 API Key 확보되는지 확인
            String apiKey = managerClient.getOrCreateApiKey();
            assertNotNull(apiKey, "API Key가 정상적으로 발급되어야 합니다");
            assertFalse(apiKey.trim().isEmpty(), "API Key가 비어있으면 안됩니다");
            
            log.info("API Key 확보 완료, 길이: {}", apiKey.length());
            
            // CommonClient가 이 API Key를 사용해서 정상 동작하는지 확인
            InquireBankCodesResponse response = commonClient.inquireBankCodes();
            assertNotNull(response, "CommonClient 응답이 null이면 안됩니다");
            assertNotNull(response.getHeader(), "응답 헤더가 null이면 안됩니다");
            
            log.info("ManagerClient와의 연동 테스트 완료");
            
        } catch (Exception e) {
            log.error("ManagerClient 연동 테스트 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("ManagerClient 연동 테스트 실패: " + e.getMessage());
        }
    }
}