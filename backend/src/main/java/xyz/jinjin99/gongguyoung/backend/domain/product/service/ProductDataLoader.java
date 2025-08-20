package xyz.jinjin99.gongguyoung.backend.domain.product.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import xyz.jinjin99.gongguyoung.backend.domain.product.entity.Product;
import xyz.jinjin99.gongguyoung.backend.domain.product.repository.ProductRepository;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductDataLoader implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            loadInitialProducts();
            log.info("Initial product data loaded successfully");
        } else {
            log.info("Product data already exists, skipping initialization");
        }
    }

    private void loadInitialProducts() {
        List<Product> products = Arrays.asList(
            // 전자기기 & IT
            Product.builder()
                .name("애플 에어팟 프로 2세대")
                .price(350000L)
                .imageUrl("/api/v1/images/1")
                .description("노이즈 캔슬링 무선 이어폰, 대학생 필수템")
                .build(),
            
            Product.builder()
                .name("로지텍 MX Master 3 마우스")
                .price(120000L)
                .imageUrl("/api/v1/images/2")
                .description("고성능 무선 마우스, 과제용 최적")
                .build(),

            Product.builder()
                .name("아이패드 9세대 64GB")
                .price(450000L)
                .imageUrl("/api/v1/images/3")
                .description("강의 필기와 과제에 최적화된 태블릿")
                .build(),

            Product.builder()
                .name("삼성 갤럭시 버즈 프로")
                .price(180000L)
                .imageUrl("/api/v1/images/4")
                .description("삼성 스마트폰과 완벽 호환 무선 이어폰")
                .build(),

            Product.builder()
                .name("맥북 에어 M2")
                .price(1400000L)
                .imageUrl("/api/v1/images/5")
                .description("대학생 전용 교육할인 적용 노트북")
                .build(),

            // 문구류 & 학습용품
            Product.builder()
                .name("아이패드 애플펜슬 2세대")
                .price(180000L)
                .imageUrl("/api/v1/images/6")
                .description("정밀한 필기감의 스타일러스 펜")
                .build(),

            Product.builder()
                .name("제트스트림 멀티펜 세트")
                .price(15000L)
                .imageUrl("/api/v1/images/7")
                .description("부드러운 필기감의 3색 볼펜 10개 세트")
                .build(),

            Product.builder()
                .name("로켓북 스마트 노트")
                .price(45000L)
                .imageUrl("/api/v1/images/8")
                .description("재사용 가능한 친환경 스마트 노트")
                .build(),

            Product.builder()
                .name("스테들러 색연필 세트")
                .price(35000L)
                .imageUrl("/api/v1/images/9")
                .description("전공 과제용 전문가급 색연필 36색")
                .build(),

            Product.builder()
                .name("A4 복사용지 2500매")
                .price(25000L)
                .imageUrl("/api/v1/images/10")
                .description("과제 출력용 고품질 복사용지")
                .build(),

            // 생활용품
            Product.builder()
                .name("타이거 보온병 600ml")
                .price(35000L)
                .imageUrl("/api/v1/images/11")
                .description("12시간 보온 보냉 텀블러, 강의실 필수")
                .build(),

            Product.builder()
                .name("무지 캠퍼스노트 10권 세트")
                .price(30000L)
                .imageUrl("/api/v1/images/12")
                .description("심플한 디자인의 강의 필기용 노트")
                .build(),

            Product.builder()
                .name("블루라이트 차단 안경")
                .price(25000L)
                .imageUrl("/api/v1/images/13")
                .description("장시간 컴퓨터 작업시 눈 보호용")
                .build(),

            Product.builder()
                .name("USB 멀티 충전기")
                .price(20000L)
                .imageUrl("/api/v1/images/14")
                .description("4포트 고속 충전기, 기숙사 공용")
                .build(),

            Product.builder()
                .name("휴대용 보조배터리 20000mAh")
                .price(35000L)
                .imageUrl("/api/v1/images/15")
                .description("하루 종일 사용 가능한 대용량 배터리")
                .build(),

            // 의류 & 패션
            Product.builder()
                .name("유니클로 후드티 대학생팩")
                .price(80000L)
                .imageUrl("/api/v1/images/16")
                .description("기본 컬러 후드티 4벌 세트")
                .build(),

            Product.builder()
                .name("나이키 운동화 에어포스")
                .price(120000L)
                .imageUrl("/api/v1/images/17")
                .description("캠퍼스 데일리 운동화, 흰색")
                .build(),

            Product.builder()
                .name("아디다스 백팩 클래식")
                .price(65000L)
                .imageUrl("/api/v1/images/18")
                .description("노트북 수납 가능한 학생용 백팩")
                .build(),

            Product.builder()
                .name("무인양품 기본 티셔츠 10매")
                .price(90000L)
                .imageUrl("/api/v1/images/19")
                .description("베이직 컬러 면 티셔츠 세트")
                .build(),

            Product.builder()
                .name("컨버스 척테일러 올스타")
                .price(75000L)
                .imageUrl("/api/v1/images/20")
                .description("클래식 캔버스 스니커즈")
                .build(),

            // 식품 & 건강
            Product.builder()
                .name("프로틴 파우더 5kg")
                .price(120000L)
                .imageUrl("/api/v1/images/21")
                .description("헬스장 다니는 대학생용 단백질 보충제")
                .build(),

            Product.builder()
                .name("비타민 멀티팩 6개월분")
                .price(45000L)
                .imageUrl("/api/v1/images/22")
                .description("불규칙한 식사 대학생용 종합비타민")
                .build(),

            Product.builder()
                .name("즉석 라면 20개 박스")
                .price(35000L)
                .imageUrl("/api/v1/images/23")
                .description("기숙사 야식용 인기 라면 모음")
                .build(),

            Product.builder()
                .name("원두커피 1kg")
                .price(50000L)
                .imageUrl("/api/v1/images/24")
                .description("카페인 중독 대학생용 프리미엄 원두")
                .build(),

            Product.builder()
                .name("그라놀라 시리얼 10박스")
                .price(60000L)
                .imageUrl("/api/v1/images/25")
                .description("바쁜 아침 대용 건강 시리얼")
                .build(),

            // 운동용품 & 레저
            Product.builder()
                .name("요가매트 프리미엄")
                .price(45000L)
                .imageUrl("/api/v1/images/26")
                .description("기숙사 홈트레이닝용 두꺼운 매트")
                .build(),

            Product.builder()
                .name("덤벨 세트 20kg")
                .price(80000L)
                .imageUrl("/api/v1/images/27")
                .description("기숙사 웨이트 트레이닝용 조절식")
                .build(),

            Product.builder()
                .name("런닝화 아식스 젤카야노")
                .price(150000L)
                .imageUrl("/api/v1/images/28")
                .description("마라톤 동아리용 전문 러닝화")
                .build(),

            Product.builder()
                .name("스포츠 타올 10매 세트")
                .price(25000L)
                .imageUrl("/api/v1/images/29")
                .description("헬스장, 수영장 공용 마이크로파이버 타올")
                .build(),

            Product.builder()
                .name("캠핑 텐트 4인용")
                .price(200000L)
                .imageUrl("/api/v1/images/30")
                .description("동아리 캠핑용 방수 텐트")
                .build(),

            // 화장품 & 뷰티
            Product.builder()
                .name("코스메틱 세트 기초케어")
                .price(80000L)
                .imageUrl("/api/v1/images/31")
                .description("대학생 기초 스킨케어 풀세트")
                .build(),

            Product.builder()
                .name("선크림 50개들이")
                .price(120000L)
                .imageUrl("/api/v1/images/32")
                .description("야외활동 많은 대학생용 자외선 차단제")
                .build(),

            Product.builder()
                .name("립밤 20개 세트")
                .price(30000L)
                .imageUrl("/api/v1/images/33")
                .description("겨울철 필수 보습 립케어")
                .build(),

            // 가전제품
            Product.builder()
                .name("미니 냉장고 70L")
                .price(180000L)
                .imageUrl("/api/v1/images/34")
                .description("원룸, 기숙사용 소형 냉장고")
                .build(),

            Product.builder()
                .name("전기밥솥 3인용")
                .price(65000L)
                .imageUrl("/api/v1/images/35")
                .description("자취생 필수 소형 전기밥솥")
                .build(),

            Product.builder()
                .name("전자레인지 20L")
                .price(85000L)
                .imageUrl("/api/v1/images/36")
                .description("기숙사 공용 전자레인지")
                .build(),

            Product.builder()
                .name("세탁기 미니 5kg")
                .price(250000L)
                .imageUrl("/api/v1/images/37")
                .description("원룸용 소형 세탁기")
                .build(),

            // 기타 생활용품
            Product.builder()
                .name("가습기 초음파식")
                .price(40000L)
                .imageUrl("/api/v1/images/38")
                .description("건조한 기숙사용 소형 가습기")
                .build(),

            Product.builder()
                .name("스탠드 조명 LED")
                .price(35000L)
                .imageUrl("/api/v1/images/39")
                .description("독서실 분위기 눈부심 없는 조명")
                .build(),

            Product.builder()
                .name("블루투스 스피커 JBL")
                .price(90000L)
                .imageUrl("/api/v1/images/40")
                .description("기숙사 파티용 휴대용 스피커")
                .build()
        );

        productRepository.saveAll(products);
    }
}