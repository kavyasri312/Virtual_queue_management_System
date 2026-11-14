package com.smartqueue.service;

import com.smartqueue.model.Notification;
import com.smartqueue.model.User;
import com.smartqueue.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Notification sendNotification(User user, String title, String message, String type) {
        Notification notification = new Notification(user, title, message, type);
        notification = notificationRepository.save(notification);

        if (messagingTemplate != null && user != null) {
            messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), notification);
        }

        return notification;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
    }
}
