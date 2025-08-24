package xyz.jinjin99.gongguyoung.backend.global.exception;

public class GroupPurchaseNotFoundException extends RuntimeException {
    public GroupPurchaseNotFoundException(String message) {
        super(message);
    }
    
    public GroupPurchaseNotFoundException(Long groupPurchaseId) {
        super("Group purchase not found with id: " + groupPurchaseId);
    }
}