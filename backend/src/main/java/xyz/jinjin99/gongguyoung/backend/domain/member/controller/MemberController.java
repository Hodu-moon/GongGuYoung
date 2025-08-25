package xyz.jinjin99.gongguyoung.backend.domain.member.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.request.SignupRequest;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.response.SignupResponse;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;
import xyz.jinjin99.gongguyoung.backend.domain.member.service.MemberService;
import xyz.jinjin99.gongguyoung.backend.global.utils.PasswordUtil;

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
}
