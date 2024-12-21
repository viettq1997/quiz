package com.elsa.quiz.domain.dto;

public record SubmitAnswerRequest(
        String quizId,
        String userId,
        boolean correct
) {
}
