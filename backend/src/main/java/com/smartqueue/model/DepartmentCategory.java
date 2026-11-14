package com.smartqueue.model;

public enum DepartmentCategory {
    HOSPITAL("Hospitals & Healthcare"),
    BANK("Banking & Financial"),
    GOVERNMENT("Government & Municipal Services"),
    CUSTOMER_SERVICE("Customer Support & Retail");

    private final String displayName;

    DepartmentCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
