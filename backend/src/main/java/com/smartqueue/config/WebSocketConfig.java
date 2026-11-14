package com.smartqueue.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Topic for broadcasting to subscribers (e.g. /topic/queue/1, /topic/token/101, /topic/admin/stats)
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-queue")
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        // Plain WebSocket endpoint as well for standard clients
        registry.addEndpoint("/ws-queue")
                .setAllowedOriginPatterns("*");
    }
}
