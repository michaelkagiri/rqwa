class RSQS_UI {
  constructor(quizSystem) {
    this.quizSystem = quizSystem;
    this.currentQuiz = null;
    this.initEventListeners();
    this.checkLoginStatus();
  }

  initEventListeners() {
    // Login form
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      this.handleLogin(username, password);
    });

    // Registration form
    document.getElementById('register-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const userData = {
        username: document.getElementById('register-username').value,
        password: document.getElementById('register-password').value,
        email: document.getElementById('register-email').value
      };
      this.handleRegistration(userData);
    });

    // Start quiz button
    document.getElementById('start-quiz-btn')?.addEventListener('click', () => {
      this.startQuiz();
    });

    // Submit quiz button
    document.getElementById('submit-quiz-btn')?.addEventListener('click', () => {
      this.submitQuiz();
    });

    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      this.quizSystem.logout();
      this.showPage('login-page');
      this.checkLoginStatus();
    });

    // Admin add question
    document.getElementById('add-question-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const questionData = {
        question: document.getElementById('question-text').value,
        options: [
          document.getElementById('option1').value,
          document.getElementById('option2').value,
          document.getElementById('option3').value,
          document.getElementById('option4').value
        ],
        correctAnswer: parseInt(document.getElementById('correct-answer').value),
        explanation: document.getElementById('explanation').value
      };
      this.addQuestion(questionData);
    });
  }

  checkLoginStatus() {
    if (this.quizSystem.currentUser) {
      this.showUserDashboard();
    } else {
      this.showPage('login-page');
    }
  }

  showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
      page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
  }

  handleLogin(username, password) {
    const result = this.quizSystem.login(username, password);
    if (result.success) {
      this.showUserDashboard();
    } else {
      this.showAlert(result.message, 'error');
    }
  }

  handleRegistration(userData) {
    const result = this.quizSystem.register(userData);
    if (result.success) {
      this.showAlert('Registration successful! Please login.', 'success');
      this.showPage('login-page');
    } else {
      this.showAlert(result.message, 'error');
    }
  }

  showUserDashboard() {
    const user = this.quizSystem.currentUser;
    document.getElementById('welcome-message').textContent = `Welcome, ${user.username}!`;
    
    if (user.role === 'admin') {
      document.getElementById('admin-section').style.display = 'block';
    } else {
      document.getElementById('admin-section').style.display = 'none';
    }
    
    this.showPage('dashboard-page');
  }

  startQuiz() {
    const result = this.quizSystem.startQuiz();
    if (result.success) {
      this.currentQuiz = result.questions;
      this.displayQuizQuestions();
      this.showPage('quiz-page');
    } else {
      this.showAlert(result.message, 'error');
    }
  }

  displayQuizQuestions() {
    const quizContainer = document.getElementById('quiz-questions');
    quizContainer.innerHTML = '';
    
    this.currentQuiz.forEach((question, index) => {
      const questionElement = document.createElement('div');
      questionElement.className = 'question';
      questionElement.innerHTML = `
        <h4>Question ${index + 1}: ${question.question}</h4>
        <div class="options">
          ${question.options.map((option, i) => `
            <div class="form-check">
              <input class="form-check-input" type="radio" 
                     name="question-${question.id}" 
                     id="q${question.id}-option${i}" 
                     value="${i}">
              <label class="form-check-label" for="q${question.id}-option${i}">
                ${option}
              </label>
            </div>
          `).join('')}
        </div>
      `;
      quizContainer.appendChild(questionElement);
    });
  }

  submitQuiz() {
    const answers = [];
    this.currentQuiz.forEach(question => {
      const selectedOption = document.querySelector(`input[name="question-${question.id}"]:checked`);
      if (selectedOption) {
        answers.push({
          questionId: question.id,
          selectedOption: parseInt(selectedOption.value)
        });
      }
    });

    if (answers.length !== this.currentQuiz.length) {
      this.showAlert('Please answer all questions before submitting.', 'error');
      return;
    }

    const result = this.quizSystem.submitQuiz(answers);
    if (result.success) {
      this.displayQuizResults(result.result);
      this.showPage('results-page');
    } else {
      this.showAlert(result.message, 'error');
    }
  }

  displayQuizResults(result) {
    const resultsContainer = document.getElementById('quiz-results');
    resultsContainer.innerHTML = `
      <h3>Quiz Results</h3>
      <p>Score: ${result.score.toFixed(1)}%</p>
      <div class="results-details">
        ${result.details.map(detail => `
          <div class="result-item ${detail.isCorrect ? 'correct' : 'incorrect'}">
            <p><strong>Question:</strong> ${detail.questionText}</p>
            <p><strong>Your answer:</strong> ${this.currentQuiz.find(q => q.id === detail.questionId).options[detail.selectedOption]}</p>
            <p><strong>Correct answer:</strong> ${this.currentQuiz.find(q => q.id === detail.questionId).options[detail.correctOption]}</p>
            <p><strong>Explanation:</strong> ${detail.explanation}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  addQuestion(questionData) {
    const result = this.quizSystem.addQuestion(questionData);
    if (result.success) {
      this.showAlert('Question added successfully!', 'success');
      document.getElementById('add-question-form').reset();
    } else {
      this.showAlert(result.message, 'error');
    }
  }

  showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const alertsContainer = document.getElementById('alerts-container');
    alertsContainer.innerHTML = '';
    alertsContainer.appendChild(alertDiv);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const quizSystem = new RoadSafetyQuizSystem();
 window.ui = new RSQS_UI(quizSystem);
});