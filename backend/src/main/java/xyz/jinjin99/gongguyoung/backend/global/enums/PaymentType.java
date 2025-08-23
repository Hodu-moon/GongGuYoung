package xyz.jinjin99.gongguyoung.backend.global.enums;

public enum PaymentType {
    IMMEDIATE_ONLY,     // 일반 결제만
    BNPL_ONLY,   // BNPL만
    SPLIT        // 일반 + BNPL 혼합
}