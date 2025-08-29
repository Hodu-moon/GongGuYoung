package xyz.jinjin99.gongguyoung.backend.domain.member.service;

import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.request.SignupRequest;

@Component
@RequiredArgsConstructor
@Order(3)
public class MemberDataLoader implements CommandLineRunner {

  private final MemberService memberService;
  private final ObjectMapper objectMapper;

  @Override
  public void run(String... args) throws Exception {
    Map<String, String> memberData = Map.of("email", "novelss13@jbnu.ac.kr", "name", "진덕종", "password", "password123");
    SignupRequest signupRequest = objectMapper.convertValue(memberData, SignupRequest.class);
    memberService.signupMember(signupRequest);
  }
}
