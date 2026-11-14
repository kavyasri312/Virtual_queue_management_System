package com.smartqueue.dto;

public class PeakHourStatsDto {
    private String hour;
    private long tokenCount;

    public PeakHourStatsDto() {
    }

    public PeakHourStatsDto(String hour, long tokenCount) {
        this.hour = hour;
        this.tokenCount = tokenCount;
    }

    public String getHour() {
        return hour;
    }

    public void setHour(String hour) {
        this.hour = hour;
    }

    public long getTokenCount() {
        return tokenCount;
    }

    public void setTokenCount(long tokenCount) {
        this.tokenCount = tokenCount;
    }
}
