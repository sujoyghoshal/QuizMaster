const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

//*Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static('.'));
app.use(express.static('./css'));
//*Load JSON file
const questionsPath = path.resolve(__dirname, 'database.json');

//*nitialize game state
let currentQuestion = null;
let remainingAttempts = 3;
let score = 0;

//*Endpoint to get a random question
app.get('/get_question', (req, res) => {
    fs.readFile(questionsPath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            const questions = JSON.parse(data);
            const randomIndex = Math.floor(Math.random() * questions.length);
            currentQuestion = questions[randomIndex];
            remainingAttempts = 3;
            const answerUnderscores = '_'.repeat(currentQuestion.Answer.length);
            res.json({ question: currentQuestion.Question, answerUnderscores });
        }
    });
});

//*Endpoint to check the user's answer
app.post('/check_answer', (req, res) => {
    const userAnswer = req.body.answer.toLowerCase();
    const correctAnswer = currentQuestion.Answer.toLowerCase();

    if (userAnswer === correctAnswer) {
        score += 1;
        res.json({ message: 'Correct answer! You earned a point.', score });
    } else {
        remainingAttempts -= 1;
        if (remainingAttempts > 0) {
            res.json({ message: `Incorrect answer! You have ${remainingAttempts} attempts left. Try again.`, score });
        } else {
            res.json({ message: `You've used all your attempts. The correct answer was "${correctAnswer}".`, score });
        }
    }
});

//*Endpoint to get the current score
app.get('/score', (req, res) => {
    res.json({ score });
});

//*Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
