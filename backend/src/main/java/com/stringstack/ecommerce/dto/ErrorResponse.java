package com.stringstack.ecommerce.dto;

import java.util.Map;

public class ErrorResponse {

    private final String message;
    private final Map<String, String> errors;

    public ErrorResponse(String message, Map<String, String> errors) {
        this.message = message;
        this.errors = errors;
    }

    public String getMessage() {
        return message;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
