package com.stringstack.ecommerce.dto;

public class PaymentVerifyResponse {

    private String message;
    private String orderId;
    private boolean verified;

    public PaymentVerifyResponse() {
    }

    public PaymentVerifyResponse(String message, String orderId, boolean verified) {
        this.message = message;
        this.orderId = orderId;
        this.verified = verified;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }
}
