package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.request.CreateGroupPurchaseRequest;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.response.GroupPurchaseResponse;

import java.util.List;

@Tag(name = "공동구매", description = "공동구매 관련 API")
public interface GroupPurchaseController {

    @Operation(
        summary = "공동구매 생성",
        description = "새로운 공동구매를 생성하고 만료 스케줄링을 등록합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "공동구매 생성 성공",
            content = @Content(schema = @Schema(implementation = GroupPurchaseResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "상품을 찾을 수 없음"
        )
    })
    ResponseEntity<GroupPurchaseResponse> createGroupPurchase(
        @RequestBody CreateGroupPurchaseRequest request
    );

    @Operation(
        summary = "전체 공동구매 목록 조회",
        description = "등록된 모든 공동구매 목록을 조회합니다."
    )
    @ApiResponse(
        responseCode = "200",
        description = "공동구매 목록 조회 성공",
        content = @Content(schema = @Schema(implementation = GroupPurchaseResponse.class))
    )
    ResponseEntity<List<GroupPurchaseResponse>> getAllGroupPurchases();

    @Operation(
        summary = "공동구매 상세 조회",
        description = "공동구매 ID로 특정 공동구매의 상세 정보를 조회합니다. 조회수 증가 여부를 선택할 수 있습니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "공동구매 조회 성공",
            content = @Content(schema = @Schema(implementation = GroupPurchaseResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "공동구매를 찾을 수 없음"
        )
    })
    ResponseEntity<GroupPurchaseResponse> getGroupPurchase(
        @Parameter(description = "공동구매 ID", required = true)
        @PathVariable Long id,
        @Parameter(description = "조회수 증가 여부 (기본값: false)")
        @RequestParam(defaultValue = "false") boolean increaseViewCount
    );
}
