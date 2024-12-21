package com.elsa.quiz.controller;

import com.elsa.quiz.domain.dto.JoinQuizRequest;
import com.elsa.quiz.domain.dto.SubmitAnswerRequest;
import com.elsa.quiz.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;

    @PostMapping("/join")
    public ResponseEntity<String> joinQuiz(@RequestBody JoinQuizRequest request) {
        quizService.joinQuiz(request);
        return ResponseEntity.ok("User joined successfully");
    }

    @PostMapping("/answer")
    public ResponseEntity<String> submitAnswer(@RequestBody SubmitAnswerRequest request) {
        quizService.submitAnswer(request);
        return ResponseEntity.ok("Answer submitted");
    }

    @GetMapping("/leaderboard/{quizId}")
    public ResponseEntity<Map<Object, Object>> getLeaderboard(@PathVariable String quizId) {
        return ResponseEntity.ok(quizService.getLeaderboard(quizId));
    }
}
