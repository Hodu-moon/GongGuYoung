package xyz.jinjin99.gongguyoung.backend.domain.notification.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.jinjin99.gongguyoung.backend.domain.notification.dto.request.FCMTokenRequest;
import xyz.jinjin99.gongguyoung.backend.domain.notification.service.UserDeviceTokenService;

@Slf4j
@RestController
@RequestMapping("/api/fcm")
@RequiredArgsConstructor
public class FCMController {

    private final UserDeviceTokenService userDeviceTokenService;

    @PostMapping("/token")
    public ResponseEntity<Void> registerToken(@RequestBody FCMTokenRequest request) {
        userDeviceTokenService.saveOrUpdateToken(
                request.getMemberId(), 
                request.getToken(), 
                request.getDeviceType()
        );
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/token")
    public ResponseEntity<Void> removeToken(
            @RequestParam Long memberId,
            @RequestParam String token) {
        userDeviceTokenService.removeToken(memberId, token);
        return ResponseEntity.ok().build();
    }
}