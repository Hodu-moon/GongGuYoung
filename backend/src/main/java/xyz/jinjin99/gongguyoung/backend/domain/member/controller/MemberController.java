package xyz.jinjin99.gongguyoung.backend.domain.member.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.request.SignupRequest;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.response.MemberStarterAccountResponse;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.response.SignupResponse;
import xyz.jinjin99.gongguyoung.backend.domain.member.service.MemberService;

@Tag(name="회원", description = "회원 관련 API")
@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;
    @PostMapping
    @Operation(description = "회원 가입함수입니다.", summary = "회원 가입")
    public ResponseEntity<SignupResponse> signUp(@Valid @RequestBody SignupRequest request){

        SignupResponse response = memberService.signupMember(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/starter-balance")
    @Operation(summary = "회원의 일반 계좌 잔액 조회(아직 테스트 안함 안되면 바로 말 ㄱㄱ)", description = "회원의 일반 계좌(starter account) 의 잔액을 조회합니다.")
    public ResponseEntity<MemberStarterAccountResponse> getStarterBalance(@PathVariable Long id){
        MemberStarterAccountResponse starterBalance = memberService.getStarterBalance(id);

        return ResponseEntity.ok(starterBalance);
    }

}
