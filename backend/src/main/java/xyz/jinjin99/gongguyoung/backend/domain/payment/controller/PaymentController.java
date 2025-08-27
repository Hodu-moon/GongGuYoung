package xyz.jinjin99.gongguyoung.backend.domain.payment.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request.PayBNPLRequest;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request.PaymentCancellationRequest;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request.PaymentRequest;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.response.BNPLRemainResponse;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.response.ProcessingBnplResponse;
import xyz.jinjin99.gongguyoung.backend.domain.payment.service.BnplService;
import xyz.jinjin99.gongguyoung.backend.domain.payment.service.PaymentService;

import java.util.List;

@Tag(name = "결제", description = "결제 관련 API")
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final BnplService bnplService;

    @PostMapping
    @Operation(summary = "공동구매 결제 참여 ", description = "회원이 공동구매 참여하여 결제한다.  payment type = \"IMMEDIATE_ONLY\", \"BNPL\" 초기데이터가 없어서 example 에는 값이 안들어가있어요 추후에 고칠게요")
    public ResponseEntity<?> processPayment(@Valid @RequestBody PaymentRequest request) {
        paymentService.processPayment(request);
        return ResponseEntity.ok("성공적으로 참여했습니다.");
    }

    @PostMapping("/refund")
    @Operation(summary = "공동구매 결제 취소 ", description = "회원이 공동구매 결제를 취소한다.")

    public ResponseEntity<?> refundPayment(@Valid @RequestBody PaymentCancellationRequest request) {
        paymentService.refundPayment(request);
        return ResponseEntity.ok("성공적으로 취소하였습니다.");
    }



    @GetMapping("/bnpl/processing")
    @Operation(summary = "진행중인 BNPL 확인 ", description = "진행중인 BNPL 확인, paymentId,  item name, item image url, bnpl status (PROCESSING, DONE), bnpl amount(얼마 갚아야 하는지 ) 정보를 담고 있음")
    public ResponseEntity<List<ProcessingBnplResponse>> getProcessingBNPL(@RequestParam Long memberId) {

        List<ProcessingBnplResponse> list = bnplService.listProcessBnplPayments(memberId);

        return ResponseEntity.ok(list);
    }

    @GetMapping("/bnpl")
    @Operation(summary = "BNPL 잔액 조회", description = "BNPL 잔액 조회")
    public ResponseEntity<BNPLRemainResponse> getBNPLRemain(
            @RequestParam
            @NotNull(message = "memberId는 필수입니다.")
            @Positive(message = "memberId는 양수여야 합니다.")
            Long memberId
    ) {
        BNPLRemainResponse bnplRemain = bnplService.getBNPLRemain(memberId);
        return ResponseEntity.ok(bnplRemain);
    }

    @PostMapping("/bnpl")
    @Operation(summary = "bnpl 갚기 ", description = "bnpl 돈 갚기 ")
    public ResponseEntity<String> payBnpl(
            @Valid
            @RequestBody
            PayBNPLRequest request
    ){
        bnplService.payBnpl(request.getPaymentId(), request.getMemberId());
        return ResponseEntity.ok("성공적으로 처리 되었습니다.");
    }


}
