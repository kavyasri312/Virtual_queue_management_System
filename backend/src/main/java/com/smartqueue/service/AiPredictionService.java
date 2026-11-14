package com.smartqueue.service;

import com.smartqueue.dto.AiWaitResponse;
import com.smartqueue.dto.WaitPredictionRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AiPredictionService {

    private final RestTemplate restTemplate = new RestTemplate();

    // URL of the Python AI service; configurable via env variable
    @Value("${ai.service.base-url:http://localhost:8000}")
    private String aiBaseUrl;

    /**
     * Calls the AI FastAPI endpoint to get a waiting‑time prediction for a token.
     * If the AI service is unavailable or returns an error, falls back to the baseline
     * estimation (same logic as the existing QueueService method).
     */
    public AiWaitResponse getPrediction(Long tokenId, Long departmentId, int peopleAhead,
                                        int activeCounters, String priority,
                                        double historicalAvgDuration) {
        // Build request payload – the Python service expects booking_time etc.; we can provide minimal fields.
        WaitPredictionRequest req = new WaitPredictionRequest();
        req.setDepartmentId(departmentId.intValue());
        req.setBookingTime(java.time.LocalDateTime.now()); // approximate
        req.setDayOfWeek(java.time.LocalDate.now().getDayOfWeek().getValue() % 7); // 0=Mon
        req.setPeopleAhead(peopleAhead);
        req.setActiveCounters(activeCounters);
        req.setPriority(priority);
        req.setHistoricalAvgDuration(historicalAvgDuration);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<WaitPredictionRequest> entity = new HttpEntity<>(req, headers);
            String url = aiBaseUrl + "/predict-wait";
            return restTemplate.postForObject(url, entity, AiWaitResponse.class);
        } catch (Exception ex) {
            // Fallback: simple baseline calculation matching the placeholder in Python
            double baseline = (peopleAhead * historicalAvgDuration) / Math.max(activeCounters, 1);
            return new AiWaitResponse(baseline, "BASELINE");
        }
    }
}
