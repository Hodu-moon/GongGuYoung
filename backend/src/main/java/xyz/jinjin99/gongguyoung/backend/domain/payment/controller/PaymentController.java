package xyz.jinjin99.gongguyoung.backend.domain.payment.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request.PaymentRequest;
import xyz.jinjin99.gongguyoung.backend.domain.payment.service.PaymentService;

@Tag(name = "결제", description = "결제 관련 API")
@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "공동구매 결제 참여 ", description = "회원이 공동구매 참여하여 결제한다. 초기데이터가 없어서 example 에는 값이 안들어가있어요 추후에 고칠게요")
    public ResponseEntity<?> processPayment(@Valid @RequestBody PaymentRequest request){

        log.info("request : {}", request);


        return null;
    }
}
