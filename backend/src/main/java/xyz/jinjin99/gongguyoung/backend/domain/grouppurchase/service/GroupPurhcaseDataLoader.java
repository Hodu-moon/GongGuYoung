package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchase;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.repository.GroupPurchaseRepository;
import xyz.jinjin99.gongguyoung.backend.domain.product.repository.ProductRepository;
import xyz.jinjin99.gongguyoung.backend.global.enums.GroupPurchaseStatus;

@Component
@RequiredArgsConstructor
@Order(2)
public class GroupPurhcaseDataLoader implements CommandLineRunner{

  private final GroupPurchaseRepository groupPurchaseRepository;
  private final AccountService accountService;
  private final ProductRepository productRepository;
  @Override
  public void run(String... args) throws Exception {
    loadInitialGroupPurhcases();
  }

  private void loadInitialGroupPurhcases() {
    List<GroupPurchase> groupPurchases = Arrays.asList(
      GroupPurchase.builder()
      .product(productRepository.findById(1L).get())
      .title("애플 에어팟 프로 2세대 공구")
      .context("애플 에어팟 프로 2세대 같이 공구하실분! 노이즈 캔슬링 성능 최고입니다.")
      .targetCount(15)
      .currentCount(12)
      .endAt(LocalDateTime.now().plusDays(3))
      .discountedPrice((long) (350000 * 0.92))
      .accountNo(accountService.createGroupPurchaseAccount())
      .status(GroupPurchaseStatus.WAITING)
      .build(),
      
      GroupPurchase.builder()
      .product(productRepository.findById(5L).get())
      .title("맥북 에어 M2 공동구매")
      .context("대학생 필수템 맥북! 교육할인 + 공구할인으로 더 저렴하게!")
      .targetCount(8)
      .currentCount(3)
      .endAt(LocalDateTime.now().plusDays(7))
      .discountedPrice((long) (1400000 * 0.85))
      .accountNo(accountService.createGroupPurchaseAccount())
      .status(GroupPurchaseStatus.WAITING)
      .build(),
      
      GroupPurchase.builder()
      .product(productRepository.findById(7L).get())
      .title("제트스트림 멀티펜 공구")
      .context("제트스트림 멀티펜 같이 공구하실분 구합니다. 같이 구매하실분 빠른 참여좀.")
      .targetCount(10)
      .endAt(LocalDateTime.now().minusDays(2))
      .discountedPrice((long) (15000 * 0.97))
      .accountNo(accountService.createGroupPurchaseAccount())
      .status(GroupPurchaseStatus.CANCELLED)
      .build(),
      
      GroupPurchase.builder()
      .product(productRepository.findById(16L).get())
      .title("유니클로 후드티 대학생팩 공구")
      .context("겨울 필수템! 유니클로 후드티 4벌 세트 공구합니다. 기본 컬러 구성!")
      .targetCount(20)
      .currentCount(18)
      .endAt(LocalDateTime.now().plusDays(5))
      .discountedPrice((long) (80000 * 0.90))
      .accountNo(accountService.createGroupPurchaseAccount())
      .status(GroupPurchaseStatus.WAITING)
      .build(),
      
      GroupPurchase.builder()
      .product(productRepository.findById(21L).get())
      .title("프로틴 파우더 헬스러 모집")
      .context("헬스장 다니는 분들! 프로틴 파우더 5kg 대용량 공구해요. 운동 효과 UP!")
      .targetCount(12)
      .currentCount(5)
      .endAt(LocalDateTime.now().plusDays(10))
      .discountedPrice((long) (120000 * 0.88))
      .accountNo(accountService.createGroupPurchaseAccount())
      .status(GroupPurchaseStatus.WAITING)
      .build(),
      
      GroupPurchase.builder()
      .product(productRepository.findById(3L).get())
      .title("아이패드 9세대 스터디 그룹")
      .context("강의 필기용 아이패드! 같이 구매해서 스터디 그룹도 만들어요~")
      .targetCount(6)
      .currentCount(8)
      .endAt(LocalDateTime.now().minusDays(1))
      .discountedPrice((long) (450000 * 0.93))
      .accountNo(accountService.createGroupPurchaseAccount())
      .status(GroupPurchaseStatus.COMPLETE)
      .build(),
      
      GroupPurchase.builder()
      .product(productRepository.findById(26L).get())
      .title("요가매트 홈트족 모집")
      .context("기숙사에서 홈트하는 분들! 프리미엄 요가매트 공구해요. 두꺼워서 층간소음 걱정 없어요!")
      .targetCount(25)
      .currentCount(22)
      .endAt(LocalDateTime.now().plusDays(4))
      .discountedPrice((long) (45000 * 0.85))
      .accountNo(accountService.createGroupPurchaseAccount())
      .status(GroupPurchaseStatus.WAITING)
      .build(),
      
      GroupPurchase.builder()
      .product(productRepository.findById(34L).get())
      .title("미니냉장고 자취생 필수템")
      .context("원룸, 기숙사 필수! 미니냉장고 70L 공구합니다. 배송비 나눠내요!")
      .targetCount(5)
      .currentCount(2)
      .endAt(LocalDateTime.now().plusDays(6))
      .discountedPrice((long) (180000 * 0.90))
      .accountNo(accountService.createGroupPurchaseAccount())
      .status(GroupPurchaseStatus.WAITING)
      .build(),
      
      GroupPurchase.builder()
      .product(productRepository.findById(13L).get())
      .title("블루라이트 차단안경 공구")
      .context("과제하느라 컴퓨터 오래 보는 분들! 눈 건강 지키세요. 블루라이트 차단안경 공구!")
      .targetCount(30)
      .currentCount(8)
      .endAt(LocalDateTime.now().plusDays(2))
      .discountedPrice((long) (25000 * 0.80))
      .accountNo(accountService.createGroupPurchaseAccount())
      .status(GroupPurchaseStatus.WAITING)
      .build(),
      
      GroupPurchase.builder()
      .product(productRepository.findById(40L).get())
      .title("JBL 블루투스 스피커 파티용")
      .context("기숙사 파티, MT용 스피커! JBL 블루투스 스피커 공구합니다. 음질 끝내줘요!")
      .targetCount(8)
      .currentCount(12)
      .endAt(LocalDateTime.now().minusDays(3))
      .discountedPrice((long) (90000 * 0.87))
      .accountNo(accountService.createGroupPurchaseAccount())
      .status(GroupPurchaseStatus.COMPLETE)
      .build()
    );

    groupPurchaseRepository.saveAll(groupPurchases);
  }
  
}
