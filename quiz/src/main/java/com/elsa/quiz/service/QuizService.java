package com.elsa.quiz.service;

import com.elsa.quiz.domain.constant.Constant;
import com.elsa.quiz.domain.dto.JoinQuizRequest;
import com.elsa.quiz.domain.dto.SubmitAnswerRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final SimpMessagingTemplate messagingTemplate;
    private final RedisTemplate<String, Object> redisTemplate;

    public void joinQuiz(JoinQuizRequest request) {
        String sessionKey = Constant.SESSION_KEY_PREFIX + request.quizId();
        redisTemplate.opsForHash().putIfAbsent(sessionKey, request.userId(), 0);
    }

    public void submitAnswer(SubmitAnswerRequest request) {
        String sessionKey = Constant.SESSION_KEY_PREFIX + request.quizId();
        Integer currentScore = (Integer) redisTemplate.opsForHash().get(sessionKey, request.userId());
        int newScore = currentScore + (request.correct() ? 10 : 0);
        redisTemplate.opsForHash().put(sessionKey, request.userId(), newScore);

        Map<Object, Object> scores = redisTemplate.opsForHash().entries(sessionKey);
        messagingTemplate.convertAndSend("/topic/leaderboard/" + request.quizId(), scores);
    }

    public Map<Object, Object> getLeaderboard(String quizId) {
        String sessionKey = Constant.SESSION_KEY_PREFIX + quizId;
        return redisTemplate.opsForHash().entries(sessionKey);
    }
}
