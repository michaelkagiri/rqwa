class RoadSafetyQuizSystem {
  constructor() {
    this.users = [];
    this.currentUser = null;
    this.questions = [];
    this.quizResults = [];
    this.loadInitialData();
  }

  // Initialize with sample data
  loadInitialData() {
    // Sample questions
    this.questions = [
      {
        id: 1,
        question: "What should you do when approaching a red traffic light?",
        options: [
          "Speed up to cross before it turns red",
          "Stop completely until it turns green",
          "Slow down but proceed if clear",
          "Ignore it if no other vehicles are present"
        ],
        correctAnswer: 1,
        explanation: "You must come to a complete stop at a red light and wait until it turns green."
      },
      {
        id: 2,
        question: "When should pedestrians use designated crossings?",
        options: [
          "Only during the day",
          "Only when traffic is heavy",
          "At all times when available",
          "Only when supervised"
        ],
        correctAnswer: 2,
        explanation: "Pedestrians should always use designated crossings when available for their safety."
      },
      // Add more questions...
    ];

    // Sample admin user
    this.users.push({
      id: 1,
      username: "admin",
      password: "admin123",
      role: "admin",
      email: "admin@roadsafety.org"
    });
  }

  // User authentication
  login(username, password) {
    const user = this.users.find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser = user;
      return { success: true, user };
    }
    return { success: false, message: "Invalid credentials" };
  }

  logout() {
    this.currentUser = null;
  }

  // User registration
  register(userData) {
    // Validate input
    if (!userData.username || !userData.password || !userData.email) {
      return { success: false, message: "All fields are required" };
    }

    // Check if username exists
    if (this.users.some(u => u.username === userData.username)) {
      return { success: false, message: "Username already exists" };
    }

    // Create new user
    const newUser = {
      id: this.users.length + 1,
      username: userData.username,
      password: userData.password,
      email: userData.email,
      role: "student" // Default role
    };

    this.users.push(newUser);
    return { success: true, user: newUser };
  }

  // Quiz functionality
  startQuiz() {
    if (!this.currentUser) {
      return { success: false, message: "You must be logged in to take the quiz" };
    }

    // Shuffle questions for variety
    const shuffledQuestions = [...this.questions].sort(() => 0.5 - Math.random());
    return { success: true, questions: shuffledQuestions.slice(0, 10) }; // Return 10 random questions
  }

  submitQuiz(answers) {
    if (!this.currentUser) {
      return { success: false, message: "You must be logged in to submit a quiz" };
    }

    let score = 0;
    const results = [];

    answers.forEach(answer => {
      const question = this.questions.find(q => q.id === answer.questionId);
      const isCorrect = question.correctAnswer === answer.selectedOption;
      
      if (isCorrect) score++;
      
      results.push({
        questionId: question.id,
        questionText: question.question,
        selectedOption: answer.selectedOption,
        correctOption: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    });

    const percentage = (score / answers.length) * 100;
    const quizResult = {
      userId: this.currentUser.id,
      date: new Date(),
      score: percentage,
      details: results
    };

    this.quizResults.push(quizResult);
    return { success: true, result: quizResult };
  }

  // Admin functions
  addQuestion(questionData) {
    if (!this.currentUser || this.currentUser.role !== "admin") {
      return { success: false, message: "Admin privileges required" };
    }

    const newQuestion = {
      id: this.questions.length + 1,
      ...questionData
    };

    this.questions.push(newQuestion);
    return { success: true, question: newQuestion };
  }

  // Analytics
  getUserProgress(userId) {
    if (!this.currentUser || (this.currentUser.role !== "admin" && this.currentUser.id !== userId)) {
      return { success: false, message: "Unauthorized access" };
    }

    const userResults = this.quizResults.filter(r => r.userId === userId);
    return { success: true, results: userResults };
  }

  getSystemAnalytics() {
    if (!this.currentUser || this.currentUser.role !== "admin") {
      return { success: false, message: "Admin privileges required" };
    }

    const totalQuizzesTaken = this.quizResults.length;
    const averageScore = totalQuizzesTaken > 0 
      ? this.quizResults.reduce((sum, r) => sum + r.score, 0) / totalQuizzesTaken
      : 0;

    return {
      success: true,
      analytics: {
        totalUsers: this.users.length,
        totalQuizzesTaken,
        averageScore,
        mostMissedQuestions: this.calculateMostMissedQuestions()
      }
    };
  }

  calculateMostMissedQuestions() {
    const questionStats = {};
    
    this.quizResults.forEach(result => {
      result.details.forEach(detail => {
        if (!detail.isCorrect) {
          if (!questionStats[detail.questionId]) {
            questionStats[detail.questionId] = {
              questionText: detail.questionText,
              count: 0
            };
          }
          questionStats[detail.questionId].count++;
        }
      });
    });

    return Object.values(questionStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 most missed questions
  }
}

// Initialize the system
const rsqs = new RoadSafetyQuizSystem();