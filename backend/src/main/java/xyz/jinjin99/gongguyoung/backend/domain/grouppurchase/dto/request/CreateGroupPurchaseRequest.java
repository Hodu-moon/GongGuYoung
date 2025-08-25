package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.request;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "공동구매 생성 요청")
public class CreateGroupPurchaseRequest {
  
  @Schema(description = "공동구매 제목", example = "아이폰15 공동구매", required = true)
  private String title;
  
  @Schema(description = "공동구매 글 내용", example = "최신 아이폰을 저렴하게 구매해요!", required = true)
  private String context;
  
  @Schema(description = "상품 ID", example = "1", required = true)
  private Integer productId;
  
  @Schema(description = "공동구매 종료 시간", example = "2024-12-31T23:59:59", required = true)
  private LocalDateTime endAt;
  
  @Schema(description = "목표 구매 인원", example = "10", required = true)
  private Integer targetCount;
  
  @Schema(description = "할인된 가격 (원 단위)", example = "1200000", required = true)
  private Long discountedPrice;
}
