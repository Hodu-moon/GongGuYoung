package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.request.CreateGroupPurchaseRequest;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.response.GroupPurchaseResponse;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.service.GroupPurchaseService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RestController
@RequestMapping("/api/v1/group-purchase")
@RequiredArgsConstructor
public class GroupPurchaseControllerImpl implements GroupPurchaseController {

    private final GroupPurchaseService groupPurchaseService;

    @PostMapping
    @Override
    public ResponseEntity<GroupPurchaseResponse> createGroupPurchase(@RequestBody CreateGroupPurchaseRequest request) {
        GroupPurchaseResponse groupPurchase = groupPurchaseService.createGroupPurchaseAndRegisterScheduling(request);
        return ResponseEntity.ok(groupPurchase);
    }

    @GetMapping
    @Override
    public ResponseEntity<List<GroupPurchaseResponse>> getAllGroupPurchases() {
        List<GroupPurchaseResponse> groupPurchases = groupPurchaseService.getAllGroupPurchases();
        return ResponseEntity.ok(groupPurchases);
    }

    @GetMapping("/{id}")
    @Override
    public ResponseEntity<GroupPurchaseResponse> getGroupPurchase(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean increaseViewCount) {
        GroupPurchaseResponse groupPurchase = increaseViewCount
                ? groupPurchaseService.getGroupPurchaseByIdWithViewCount(id)
                : groupPurchaseService.getGroupPurchaseById(id);
        return ResponseEntity.ok(groupPurchase);
    }

    @GetMapping("/member/{memberId}")
    @Override
    public ResponseEntity<List<GroupPurchaseResponse>> getGroupPurhcaseByMemberId(@PathVariable Long memberId) {
        List<GroupPurchaseResponse> groupPurchases = groupPurchaseService.getAllGroupPurchasesByMemberId(memberId);
        return ResponseEntity.ok(groupPurchases);
    }
}
