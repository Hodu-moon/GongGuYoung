package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.request;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupPurchaseRequest {
  private String title;
  private String context;
  private Integer productId;
  private LocalDateTime endAt;
  private Integer targetCount;
}
