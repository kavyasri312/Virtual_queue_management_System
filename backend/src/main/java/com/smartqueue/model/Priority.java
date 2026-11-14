package com.smartqueue.model;

public enum Priority {
    EMERGENCY(1, "Emergency / Urgent"),
    PERSON_WITH_DISABILITY(2, "Person with Disability"),
    SENIOR_CITIZEN(3, "Senior Citizen (60+)"),
    NORMAL(4, "Standard / Normal");

    private final int rank;
    private final String displayName;

    Priority(int rank, String displayName) {
        this.rank = rank;
        this.displayName = displayName;
    }

    public int getRank() {
        return rank;
    }

    public String getDisplayName() {
        return displayName;
    }
}
