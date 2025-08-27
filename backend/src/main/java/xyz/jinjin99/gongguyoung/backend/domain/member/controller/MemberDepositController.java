package xyz.jinjin99.gongguyoung.backend.domain.member.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.request.DepositRequest;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.response.DepositResponse;
import xyz.jinjin99.gongguyoung.backend.domain.member.service.DepositService;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/members/{memberId}")
@Tag(name = "입금", description = "회원의 계좌에 입금하는 API")
public class MemberDepositController {

    private final DepositService depositService;
    @PostMapping("/deposits")
    @Operation(summary = "starter(일반) 계좌에 입금하기 "
        ,description = "starter 계좌에 입금하는것입니다. 반환값은 통장 잔액, 얼마 넣었는지, 넣은 시각 yyyy-MM-dd HH:mm: "
    )
    public ResponseEntity<DepositResponse> deposit(
            @PathVariable Long memberId,
            @RequestBody DepositRequest depositRequest
            ){

        DepositResponse deposit = depositService.deposit(memberId, depositRequest.getAmount());

        return ResponseEntity.ok(deposit);
    }


}
