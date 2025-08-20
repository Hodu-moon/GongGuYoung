package xyz.jinjin99.gongguyoung.backend.domain.member.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.request.LoginRequest;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.response.MemberSummary;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;
import xyz.jinjin99.gongguyoung.backend.domain.member.service.MemberService;

import java.io.IOException;
import java.time.Duration;
import java.util.Base64;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class AuthController {

    private final MemberService memberService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) throws JsonProcessingException {
        // 1) 검증 (예: 이메일/패스워드 확인)
        Member member = memberService.authenticate(req.getEmail(), req.getPassword());

        // 2) 쿠키에 담을 요약 정보 (민감정보 제외)
        MemberSummary summary = new MemberSummary(member.getId(), member.getEmail(), member.getName(), member.getUserKey());

        // 3) JSON -> Base64-url 인코딩(쿠키에 안전하게 넣기)
        String payload = encode(summary);

        // 4) 쿠키 생성 (클라이언트에서 읽을거면 httpOnly(false))
        ResponseCookie cookie = ResponseCookie.from("member", payload)
                .httpOnly(false)              // 클라 JS에서 읽게 하려면 false, 보안 강하게 하려면 true
//                .secure(true)                 // HTTPS 환경 권장
                .sameSite("Lax")              // 필요에 따라 Strict/None
                .path("/")
                .maxAge(Duration.ofDays(7))   // 유효기간
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("로그인 성공");
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // 같은 이름/경로로 MaxAge=0 쿠키 내려서 삭제
        ResponseCookie expired = ResponseCookie.from("member", "")
                .httpOnly(false)
                .secure(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expired.toString())
                .body("로그아웃 성공");
    }


    private String encode(MemberSummary summary) throws JsonProcessingException {
        byte[] json = objectMapper.writeValueAsBytes(summary);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(json);
    }

    // 필요시 디코드도 가능
    private MemberSummary decode(String base64) throws IOException {
        byte[] json = Base64.getUrlDecoder().decode(base64);
        return objectMapper.readValue(json, MemberSummary.class);
    }

}
