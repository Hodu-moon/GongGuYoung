package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.request.CreateGroupPurchaseRequest;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.response.GroupPurchaseResponse;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.service.GroupPurchaseService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@RestController
@RequestMapping("/api/v1/group-purchase")
@RequiredArgsConstructor
public class GroupPurchaseController {

  private final GroupPurchaseService groupPurchaseService;

  @PostMapping
  public ResponseEntity<GroupPurchaseResponse> createGroupPurchase(@RequestBody CreateGroupPurchaseRequest request) {
    GroupPurchaseResponse groupPurchase = groupPurchaseService.createGroupPurchase(request);
    return ResponseEntity.ok(groupPurchase);
  }

  @GetMapping
  public ResponseEntity<List<GroupPurchaseResponse>> getAllGroupPurchases() {
    List<GroupPurchaseResponse> groupPurchases = groupPurchaseService.getAllGroupPurchases();
    return ResponseEntity.ok(groupPurchases);
  }

}
