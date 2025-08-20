package xyz.jinjin99.gongguyoung.backend.domain.member.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.MemberClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.MemberRecord;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.request.SignupRequest;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.response.SignupResponse;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;
import xyz.jinjin99.gongguyoung.backend.domain.member.repository.MemberRepository;
import xyz.jinjin99.gongguyoung.backend.global.utils.PasswordUtil;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordUtil passwordUtil;
    private final MemberClient memberClient;

    // TODO 1. 중복 회원가입 방지
    public SignupResponse signupMember(SignupRequest request){



        String encodedPassword = passwordUtil.encodeSHA256(request.getPassword());
//        MemberRecord member1 = memberClient.createMember(request.getEmail());

        Member member = Member.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(encodedPassword)
//                .userKey(member1.getUserKey())
                .build();

        Member saved = memberRepository.save(member);

        return SignupResponse.builder()
                .id(saved.getId())
                .email(saved.getEmail())
                .name(saved.getName())
//                .userKey(saved.getUserKey())
                .build();
    }

    public Member authenticate(String email, String password){
        Member member = memberRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("here"));


        if(passwordUtil.matches(password, member.getPassword())){
            return member;
        }

        throw new RuntimeException("ID 비밀번호 맞지 않음");
    }



}
