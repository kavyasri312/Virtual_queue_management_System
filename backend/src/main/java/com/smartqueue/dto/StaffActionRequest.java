package com.smartqueue.dto;

public class StaffActionRequest {
    private Long tokenId;
    private String notes;

    public StaffActionRequest() {
    }

    public Long getTokenId() {
        return tokenId;
    }

    public void setTokenId(Long tokenId) {
        this.tokenId = tokenId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
