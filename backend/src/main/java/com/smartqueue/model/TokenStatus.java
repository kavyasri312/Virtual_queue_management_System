package com.smartqueue.model;

public enum TokenStatus {
    WAITING,
    CALLED,
    SERVING,
    COMPLETED,
    CANCELLED,
    SKIPPED,
    NO_SHOW;

    public boolean canTransitionTo(TokenStatus next) {
        if (this == next) return true;
        return switch (this) {
            case WAITING -> next == CALLED || next == CANCELLED;
            case CALLED -> next == SERVING || next == SKIPPED || next == NO_SHOW || next == CANCELLED;
            case SERVING -> next == COMPLETED || next == SKIPPED;
            case COMPLETED, CANCELLED, NO_SHOW -> false; // Terminal states
            case SKIPPED -> next == WAITING; // Can be requeued if policy allows
        };
    }
}
