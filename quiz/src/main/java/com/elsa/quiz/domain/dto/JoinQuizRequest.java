package com.elsa.quiz.domain.dto;

public record JoinQuizRequest(
        String quizId,
        String userId
) {
}
