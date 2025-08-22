package xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.service;

import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.request.CreateGroupPurchaseRequest;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.dto.response.GroupPurchaseResponse;

import java.util.List;

public interface GroupPurchaseService {
    
    GroupPurchaseResponse createGroupPurchase(CreateGroupPurchaseRequest request);
    
    List<GroupPurchaseResponse> getAllGroupPurchases();
}