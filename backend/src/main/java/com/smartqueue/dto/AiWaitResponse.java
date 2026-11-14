package com.smartqueue.dto;

public class AiWaitResponse {
    private double estimatedWaitMinutes;
    private String source; // "AI" or "BASELINE"

    public AiWaitResponse() {}

    public AiWaitResponse(double estimatedWaitMinutes, String source) {
        this.estimatedWaitMinutes = estimatedWaitMinutes;
        this.source = source;
    }

    public double getEstimatedWaitMinutes() {
        return estimatedWaitMinutes;
    }

    public void setEstimatedWaitMinutes(double estimatedWaitMinutes) {
        this.estimatedWaitMinutes = estimatedWaitMinutes;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
