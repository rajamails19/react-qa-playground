  import React, { useState, useEffect, useCallback, useMemo } from 'react';
  import { javaQuestionsData } from '../data/javaQuestionsData';
  import { reactQuestionsData } from '../data/reactQuestionsData';
  import { pythonQuestionsData } from '../data/pythonQuestionsData';
  import {reactSet1} from '../data/reactQuestionSets/reactSet1.js';
  import {reactSet2} from '../data/reactQuestionSets/reactSet2.js';
  import './qa-playground.css';

  const QAPlayground = () => {
    // State for language selection
    const [selectedLanguage, setSelectedLanguage] = useState('react');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [showSolution, setShowSolution] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [notification, setNotification] = useState(null);
    // const [selectedSet, setSelectedSet] = useState("Set 1");
    const [selectedSets, setSelectedSets] = useState({
      java: "Set 1",
      react: "Set 1",
      python: "Set 1"
    });
    
    // const reactQuestionsData = [reactSet1, reactSet2];
    // Tag-related state
    const [taggedQuestions, setTaggedQuestions] = useState({
      java: [],
      react: [],
      python: []
    });
    const [activeTag, setActiveTag] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
const [windowSize] = useState({
  width: window.innerWidth,
  height: window.innerHeight
});
    
    // Available tags
    const availableTags = ["Important", "Difficult", "GTK", "Revisit", "Others"];

    // Toggle sidebar for mobile view
const toggleSidebar = () => {
  setSidebarOpen(!sidebarOpen);
};

// Close sidebar on set selection (mobile only)
if (windowSize.width < 768) {
  setSidebarOpen(false);
}

    // Get questions based on selected language
    const getQuestions = useCallback(() => {
      let allSets;
    
      switch (selectedLanguage) {
        case 'react':
          allSets = reactQuestionsData;
          break;
        case 'python':
          allSets = pythonQuestionsData;
          break;
        case 'java':
        default:
          allSets = javaQuestionsData;
          break;
      }
    
      // Find the selected set for the current language
    const selectedSetData = allSets.find(set => set.category === selectedSets[selectedLanguage]);
    return selectedSetData ? selectedSetData.questions : [];
  }, [selectedLanguage, selectedSets]);
    
    
    // Get filtered questions based on the active tag using useMemo
    const filteredQuestions = useMemo(() => {
      const allQuestions = getQuestions();
      
      if (activeTag === '') {
        return allQuestions;
      } else {
        // Get the tag data for the current language
        const currentLanguageTags = taggedQuestions[selectedLanguage] || [];
        
        // Find the IDs of questions with the active tag
        const taggedIds = currentLanguageTags
          .filter(item => item.tag === activeTag)
          .map(item => item.id);
        
        // Filter the questions by those IDs
        return allQuestions.filter(q => taggedIds.includes(q.id));
      }
    }, [getQuestions, activeTag, taggedQuestions, selectedLanguage]);
    
    // Current question based on index using useMemo
    const currentQuestion = useMemo(() => {
      return filteredQuestions[currentQuestionIndex] || {};
    }, [filteredQuestions, currentQuestionIndex]);

    // Define all callback functions first before they're used
    const resetQuestion = useCallback(() => {
      setUserAnswer('');
      setFeedback(null);
      setShowSolution(false);
    }, []);

    useEffect(() => {
      document.body.classList.add('dark-theme');
    }, []);

    const normalizeAnswer = (answer) => {
      return answer
        .trim() // Remove leading/trailing spaces
        .replace(/\s+/g, "") // Remove ALL spaces
        .replace(/\n/g, "") // Remove newlines
        .replace(/;/g, "") // Remove semicolons
        .toLowerCase(); // Convert to lowercase
    };
    
    const showNotification = (message, type) => {
      setNotification({ message, type });
    
      setTimeout(() => {
        setNotification(null);
      }, 3000); // Hide after 3 seconds
    };

    
    const checkAnswer = useCallback(() => {
  if (!currentQuestion) return;

  const normalizedUserAnswer = normalizeAnswer(userAnswer);
  const normalizedSolution = normalizeAnswer(currentQuestion.solution);

  const isCorrect = normalizedUserAnswer === normalizedSolution;
  setFeedback(isCorrect);
  setShowSolution(true);

  // Show popup notification
  showNotification(isCorrect ? "✅ Correct!" : "❌ Not quite right. Try again.", isCorrect ? "success" : "error");
}, [currentQuestion, userAnswer]);
    
    
    const handlePrevious = useCallback(() => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        resetQuestion();
      }
    }, [currentQuestionIndex, resetQuestion]);
  
    const handleNext = useCallback(() => {
      if (currentQuestionIndex < filteredQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        resetQuestion();
      }
    }, [currentQuestionIndex, filteredQuestions.length, resetQuestion]);

    // Update your set selection function
    const handleSetSelection = (set) => {
      // First update the selected set
      setSelectedSets({
        ...selectedSets,
        [selectedLanguage]: set
      });
      
      // Then reset the question index to 0
      setCurrentQuestionIndex(0);
      resetQuestion();
    };

  // Get the current selected set based on language
  const currentSelectedSet = selectedSets[selectedLanguage];


    const toggleTheme = () => {
      setIsDarkMode(!isDarkMode);
    };

    // Handle language change
    const handleLanguageChange = (language) => {
      setSelectedLanguage(language);
      setActiveTag(''); // Reset tag filter when changing language
    };
    
    // Handle tagging a question
    const handleTagQuestion = (tag) => {
      if (!currentQuestion || !currentQuestion.id) return;
      
      const updatedTaggedQuestions = { ...taggedQuestions };
      const currentLanguageTags = [...(updatedTaggedQuestions[selectedLanguage] || [])];
      
      // Find the question in the tagged questions array
      const questionIndex = currentLanguageTags.findIndex(
        item => item.id === currentQuestion.id
      );
      
      if (questionIndex >= 0) {
        // Toggle the tag if it's already set, otherwise set it
        currentLanguageTags[questionIndex].tag = 
          currentLanguageTags[questionIndex].tag === tag ? '' : tag;
      } else {
        // Add a new entry if the question hasn't been tagged before
        currentLanguageTags.push({ id: currentQuestion.id, tag });
      }
      
      updatedTaggedQuestions[selectedLanguage] = currentLanguageTags;
      setTaggedQuestions(updatedTaggedQuestions);
    };
    
    // Handle tag filter change
    const handleTagFilter = (tag) => {
      setActiveTag(tag);
    };

    // Get the current question's tag with useMemo
    const currentTag = useMemo(() => {
      if (!currentQuestion || !currentQuestion.id) return '';
      
      const questionTagData = taggedQuestions[selectedLanguage]?.find(
        item => item.id === currentQuestion.id
      );
      
      return questionTagData?.tag || '';
    }, [currentQuestion, taggedQuestions, selectedLanguage]);

    // Safely process code string to highlight missing parts
    const highlightMissingCode = (codeString) => {
      if (!codeString) return null;
      
      const codeLines = codeString.split('\n');
      const processedLines = codeLines.map((line, lineIndex) => {
        if (line.includes('/* Missing') && line.includes('*/')) {
          // Find the position of "/* Missing" and "*/"
          const commentStart = line.indexOf('/* Missing');
          const commentEnd = line.indexOf('*/') + 2;
          
          // Split the line into three parts: before comment, comment, after comment
          const beforeComment = line.substring(0, commentStart);
          const comment = line.substring(commentStart, commentEnd);
          const afterComment = line.substring(commentEnd);
          
          return (
            <React.Fragment key={lineIndex}>
              {beforeComment}
              <span className="missing-code">{comment}</span>
              {afterComment}
            </React.Fragment>
          );
        }
        return <React.Fragment key={lineIndex}>{line}</React.Fragment>;
      });
      
      // Join lines with line breaks
      return processedLines.flatMap((line, i) => 
        i < processedLines.length - 1 
          ? [line, <br key={`br-${i}`} />] 
          : [line]
      );
    };

    // Initialize tagged questions from localStorage
    useEffect(() => {
      const savedQuestions = localStorage.getItem('taggedQuestions');
      
      if (savedQuestions) {
        try {
          setTaggedQuestions(JSON.parse(savedQuestions));
        } catch (e) {
          console.error("Error parsing saved questions:", e);
          // Initialize with default if there's an error
          setTaggedQuestions({
            java: [],
            react: [],
            python: []
          });
        }
      } else {
        // Initialize with empty tags for all questions
        const initialJavaTags = javaQuestionsData.map(q => ({ 
          id: q.id, 
          tag: '' 
        }));
        
        const initialReactTags = reactQuestionsData.map(q => ({ 
          id: q.id, 
          tag: '' 
        }));

        const initialPythonTags = pythonQuestionsData.map(q => ({ 
          id: q.id, 
          tag: '' 
        }));

        const initialTaggedQuestions = {
          java: initialJavaTags,
          react: initialReactTags,
          python: initialPythonTags
        };
        
        setTaggedQuestions(initialTaggedQuestions);
        localStorage.setItem('taggedQuestions', JSON.stringify(initialTaggedQuestions));
      }
    }, []);

    

    // Save tagged questions to localStorage whenever they change
    useEffect(() => {
      if (Object.keys(taggedQuestions).length > 0) {
        localStorage.setItem('taggedQuestions', JSON.stringify(taggedQuestions));
      }
    }, [taggedQuestions]);

    // Reset the current question index when changing languages or tags
    useEffect(() => {
      setCurrentQuestionIndex(0);
      resetQuestion();
    }, [selectedLanguage, activeTag, resetQuestion]);

    // Check screen size for responsive adjustments
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    // Set up keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e) => {
        // Skip navigation if focused on input field
        const isInputFocused = document.activeElement.tagName === 'INPUT' || 
                              document.activeElement.tagName === 'TEXTAREA';
        
        // Enter key to check answer (only if not pressing shift)
        if (e.key === 'Enter' && !e.shiftKey && !showSolution && !isInputFocused) {
          checkAnswer();
        }
        
        // Left arrow for previous question (only if not in input)
        if (e.key === 'ArrowLeft' && currentQuestionIndex > 0 && !isInputFocused) {
          handlePrevious();
        }
        
        // Right arrow for next question (only if not in input)
        if (e.key === 'ArrowRight' && currentQuestionIndex < filteredQuestions.length - 1 && !isInputFocused) {
          handleNext();
        }

        // ESC to close sidebar on mobile
if (e.key === 'Escape' && sidebarOpen) {
  setSidebarOpen(false);
}
      };

      
    
      // Add event listener
      window.addEventListener('keydown', handleKeyDown);
    
      // Clean up
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      }; 
    }, [currentQuestionIndex, showSolution, filteredQuestions.length, checkAnswer, handlePrevious, handleNext, sidebarOpen]);

    // Toggle theme and update document class for CSS
    useEffect(() => {
      if (isDarkMode) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }, [isDarkMode]);
  
    return (
      <div className={`qa-container ${isDarkMode ? 'dark-theme' : ''}`}>
        {isMobile && (
  <button 
    className="menu-toggle" 
    onClick={toggleSidebar}
    aria-label="Toggle sidebar menu"
  >
    {sidebarOpen ? '✕' : '☰'}
  </button>
)}
        <div className="content-wrapper">
        <div className={`sidebar ${isMobile && sidebarOpen ? 'open' : ''} ${isMobile && !sidebarOpen ? 'closed' : ''}`}>
    <h3>{selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Sets</h3>
    {selectedLanguage === 'react' && reactQuestionsData.map(set => (
      <button 
        key={set.category} 
        className={currentSelectedSet === set.category ? "active" : ""}
        onClick={() => handleSetSelection(set.category)}
      >
        {set.category}
      </button>
    ))}
    {selectedLanguage === 'java' && javaQuestionsData.map(set => (
      <button 
        key={set.category} 
        className={currentSelectedSet === set.category ? "active" : ""}
        onClick={() => handleSetSelection(set.category)}
      >
        {set.category}
      </button>
    ))}
    {selectedLanguage === 'python' && pythonQuestionsData.map(set => (
      <button 
        key={set.category} 
        className={currentSelectedSet === set.category ? "active" : ""}
        onClick={() => handleSetSelection(set.category)}
      >
        {set.category}
      </button>
    ))}
  </div>
          
          <div className="qa-content">
            {/* Header */}
            <div className="qa-header">
              <h1 className="qa-title">Code Playground</h1>
              <button onClick={toggleTheme} className="theme-toggle">
                {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
            
            {/* Tag Filter */}
            <div className="tag-filter-container">
              <label>Filter by Tag:</label>
              <select 
                value={activeTag} 
                onChange={(e) => handleTagFilter(e.target.value)}
                className="tag-filter-select"
              >
                <option value="">All</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            
            {/* Language Tabs */}
            <div className="language-tabs">
              <button 
                className={`language-tab ${selectedLanguage === 'java' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('java')}
              >
                Java
              </button>
              <button 
                className={`language-tab ${selectedLanguage === 'python' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('python')}
              >
                Python
              </button>
              <button 
                className={`language-tab ${selectedLanguage === 'react' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('react')}
              >
                React
              </button>
            </div>
            
            {/* Tag this question section */}
            <div className="tag-selection">
              <span className="tag-label">Tag this Question:</span>
              <div className="tag-buttons">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    className={`tag-button ${currentTag === tag ? 'selected' : ''}`}
                    onClick={() => handleTagQuestion(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            {filteredQuestions.length > 0 ? (
              <>
                {/* Navigation bar */}
                <div className="nav-container">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className={`nav-button ${currentQuestionIndex === 0 ? 'disabled' : ''}`}
                  >
                    {isMobile ? '←' : 'Previous'}
                  </button>
                
                  <span className="question-counter">
                    Question {filteredQuestions.length > 0 ? currentQuestionIndex + 1 : 0} of {filteredQuestions.length}
                  </span>
                
                  <button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === filteredQuestions.length - 1}
                    className={`nav-button ${currentQuestionIndex === filteredQuestions.length - 1 ? 'disabled' : ''}`}
                  >
                    {isMobile ? '→' : 'Next'}
                  </button>
                </div>
              
                {/* Question content */}
                <div className="question-section">
                  <h2 className="question-title">{currentQuestion?.title}</h2>
                  
                  <div className="code-container">
                    <p className="question-description">{currentQuestion?.description}</p>
                  
                    <div className="code-block">
                      <pre>{highlightMissingCode(currentQuestion?.code)}</pre>
                    </div>
                  </div>
                
                  {/* Answer input section */}
                  <div className="answer-section">
                     {/* Pop-up Notification */}
    {notification && (
      <div className={`notification ${notification.type}`}>
        {notification.message}
      </div>
    )}
    <label className="answer-label">Your Answer:</label>
    <div className="answer-container">
      <textarea
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        className="answer-input"
        placeholder={isMobile ? "Type answer here" : "Type your answer here (press Enter to check, Shift+Enter for new line)"}
        rows={3}
        onKeyDown={(e) => {
          // Prevent form submission on Enter without Shift
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            checkAnswer();
          }
        }}
      />
    </div>
  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={checkAnswer}
                      className="check-button"
                    >
                      Check Answer
                    </button>
                  </div>
                
                  {/* Solution display */}
                  {showSolution && (
                    <div className={`solution-box ${feedback ? 'correct' : 'incorrect'}`}>
                      <p className="feedback-text">
                        {feedback ? 'Correct!' : 'Not quite right.'}
                      </p>
                    
                      <div className="solution-section">
                        <p className="solution-label">Solution:</p>
                        <p className="solution-value">{currentQuestion?.solution}</p>
                      </div>
                    
                      <div className="explanation-section">
                        <p className="explanation-label">Explanation:</p>
                        <p className="explanation-value">{currentQuestion?.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-questions-message">
                <p>No questions match the selected tag. Please select a different tag or add tags to your questions.</p>
              </div>
            )}
            
            {/* Keyboard shortcuts help */}
            <div className="keyboard-shortcuts">
              {isMobile ? (
                <p>
                  <span>← Previous | → Next</span>
                  <span>Enter to Check Answer</span>
                </p>
              ) : (
                <p>Keyboard shortcuts: ⬅️ Previous | ➡️ Next | Enter to Check Answer</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default QAPlayground;