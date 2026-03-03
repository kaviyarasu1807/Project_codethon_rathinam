/**
 * AI Chatbot Component
 * Intelligent assistant for students and admins
 */

import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, X, Minimize2, Maximize2, Bot, User, 
  Sparkles, BookOpen, TrendingUp, AlertCircle, Lightbulb,
  Clock, Zap, Brain, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIChatbotProps {
  userId: number;
  userName: string;
  userRole: 'student' | 'admin';
  context?: {
    currentScore?: number;
    weakTopics?: string[];
    recentActivity?: string;
  };
}

export default function AIChatbot({ userId, userName, userRole, context }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = getGreeting();
      addMessage('assistant', greeting, getSuggestions());
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    
    if (userRole === 'student') {
      return `${timeGreeting}, ${userName}! 👋 I'm your AI learning assistant. I can help you with:\n\n• Study recommendations\n• Concept explanations\n• Performance insights\n• Quiz preparation\n• Learning strategies\n\nHow can I help you today?`;
    } else {
      return `${timeGreeting}, ${userName}! 👋 I'm your AI admin assistant. I can help you with:\n\n• Student analytics\n• Performance reports\n• Intervention suggestions\n• System insights\n• Best practices\n\nWhat would you like to know?`;
    }
  };

  const getSuggestions = () => {
    if (userRole === 'student') {
      const suggestions = [
        'How can I improve my score?',
        'Explain my weak topics',
        'Give me study tips',
        'What should I focus on?'
      ];
      
      if (context?.weakTopics && context.weakTopics.length > 0) {
        suggestions.push(`Help me with ${context.weakTopics[0]}`);
      }
      
      return suggestions;
    } else {
      return [
        'Show struggling students',
        'Performance trends',
        'Intervention strategies',
        'System analytics'
      ];
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string, suggestions?: string[]) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      suggestions
    };
    
    setMessages(prev => [...prev, message]);
    
    if (role === 'assistant' && !isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    addMessage('user', userMessage);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Generate AI response
    const response = await generateResponse(userMessage);
    
    setIsTyping(false);
    addMessage('assistant', response.content, response.suggestions);
  };

  const generateResponse = async (userMessage: string): Promise<{ content: string; suggestions?: string[] }> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Student responses
    if (userRole === 'student') {
      // Score improvement
      if (lowerMessage.includes('improve') || lowerMessage.includes('better score')) {
        return {
          content: `Great question! Here are personalized tips to improve your score:\n\n1. **Focus on Weak Areas**: ${context?.weakTopics?.slice(0, 2).join(', ') || 'Review your quiz results'}\n\n2. **Practice Regularly**: Aim for 30 minutes daily\n\n3. **Use Active Recall**: Test yourself instead of just reading\n\n4. **Manage Stress**: Your stress levels affect performance. Try relaxation techniques before quizzes.\n\n5. **Review Mistakes**: Learn from incorrect answers\n\nWould you like specific resources for any topic?`,
          suggestions: ['Show me practice questions', 'Stress management tips', 'Study schedule']
        };
      }
      
      // Weak topics
      if (lowerMessage.includes('weak') || lowerMessage.includes('struggle')) {
        const weakTopics = context?.weakTopics || ['Data Structures', 'Algorithms'];
        return {
          content: `Based on your performance, here are your areas for improvement:\n\n${weakTopics.map((topic, i) => `${i + 1}. **${topic}**\n   - Practice problems available\n   - Video tutorials recommended\n   - Estimated study time: 2-3 hours\n`).join('\n')}\n\nI recommend starting with ${weakTopics[0]} as it's foundational for other topics.`,
          suggestions: [`Practice ${weakTopics[0]}`, 'Show study plan', 'Get resources']
        };
      }
      
      // Study tips
      if (lowerMessage.includes('study') || lowerMessage.includes('tips') || lowerMessage.includes('learn')) {
        return {
          content: `Here are proven study strategies:\n\n**🎯 Pomodoro Technique**\n- Study for 25 minutes\n- Take 5-minute breaks\n- Repeat 4 times, then longer break\n\n**📝 Active Learning**\n- Teach concepts to others\n- Create mind maps\n- Practice with real problems\n\n**🧠 Spaced Repetition**\n- Review material at increasing intervals\n- Use flashcards\n- Test yourself regularly\n\n**💪 Stay Consistent**\n- Study at the same time daily\n- Create a dedicated study space\n- Eliminate distractions\n\nYour current score: ${context?.currentScore || 'N/A'}%. Let's get it higher!`,
          suggestions: ['Create study schedule', 'Practice quiz', 'Track progress']
        };
      }
      
      // Focus areas
      if (lowerMessage.includes('focus') || lowerMessage.includes('priority')) {
        return {
          content: `Based on your Learning DNA analysis, here's what to prioritize:\n\n**🔴 High Priority**\n${context?.weakTopics?.slice(0, 2).map(t => `• ${t} - Practice immediately`).join('\n') || '• Review quiz results'}\n\n**🟡 Medium Priority**\n• Time management during quizzes\n• Stress reduction techniques\n\n**🟢 Maintain Strengths**\n• Continue current study habits\n• Help peers with your strong topics\n\nRecommended action: Start with a 30-minute focused session on your weakest topic today!`,
          suggestions: ['Start practice session', 'Set goals', 'View detailed analysis']
        };
      }
      
      // Concept explanation
      if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('how does')) {
        return {
          content: `I'd be happy to explain! Could you specify which concept you'd like me to explain?\n\nPopular topics:\n• Data Structures (Arrays, Trees, Graphs)\n• Algorithms (Sorting, Searching, Dynamic Programming)\n• System Design\n• Database Concepts\n• Programming Paradigms\n\nOr ask about any specific topic from your curriculum!`,
          suggestions: ['Explain algorithms', 'Data structures basics', 'System design']
        };
      }
      
      // Default student response
      return {
        content: `I'm here to help you succeed! I can assist with:\n\n• 📚 Study strategies and tips\n• 🎯 Personalized learning recommendations\n• 💡 Concept explanations\n• 📊 Performance analysis\n• 🧠 Memory and retention techniques\n• ⏰ Time management\n\nWhat specific area would you like help with?`,
        suggestions: ['Improve my score', 'Study tips', 'Explain concepts', 'View my progress']
      };
    }
    
    // Admin responses
    else {
      // Struggling students
      if (lowerMessage.includes('struggling') || lowerMessage.includes('need help') || lowerMessage.includes('attention')) {
        return {
          content: `**Students Requiring Attention:**\n\n🔴 **Critical (3 students)**\n• John Doe - 45% avg, high stress\n• Jane Smith - 52% avg, multiple alerts\n• Bob Wilson - 48% avg, low engagement\n\n🟡 **Moderate (7 students)**\n• Struggling with specific topics\n• Inconsistent performance\n\n**Recommended Actions:**\n1. Schedule one-on-one sessions\n2. Provide additional resources\n3. Monitor progress weekly\n4. Consider peer tutoring\n\nWould you like detailed reports on any student?`,
          suggestions: ['View detailed reports', 'Intervention strategies', 'Contact students']
        };
      }
      
      // Performance trends
      if (lowerMessage.includes('trend') || lowerMessage.includes('performance') || lowerMessage.includes('analytics')) {
        return {
          content: `**Class Performance Overview:**\n\n📈 **Overall Trends**\n• Average score: 76% (↑ 3% from last month)\n• Completion rate: 89%\n• Engagement: High\n\n📊 **Topic Performance**\n• Strongest: Data Structures (82% avg)\n• Weakest: Algorithms (68% avg)\n• Most improved: System Design (↑ 8%)\n\n🎯 **Recommendations**\n• Focus on algorithm workshops\n• Provide more practice problems\n• Celebrate improvements\n\nWould you like a detailed breakdown?`,
          suggestions: ['Detailed analytics', 'Export report', 'Compare periods']
        };
      }
      
      // Intervention strategies
      if (lowerMessage.includes('intervention') || lowerMessage.includes('strategy') || lowerMessage.includes('help students')) {
        return {
          content: `**Evidence-Based Intervention Strategies:**\n\n**For Low Performers:**\n1. **Personalized Learning Plans**\n   - Identify specific gaps\n   - Set achievable milestones\n   - Weekly check-ins\n\n2. **Peer Tutoring**\n   - Match with high performers\n   - Structured sessions\n   - Track progress\n\n3. **Additional Resources**\n   - Video tutorials\n   - Practice problems\n   - Office hours\n\n**For High Stress Students:**\n1. Stress management workshops\n2. Flexible deadlines\n3. Counseling referrals\n\n**For Disengaged Students:**\n1. Gamification elements\n2. Real-world applications\n3. Group projects\n\nImplement these systematically for best results!`,
          suggestions: ['Create intervention plan', 'Schedule sessions', 'Track outcomes']
        };
      }
      
      // System insights
      if (lowerMessage.includes('system') || lowerMessage.includes('platform') || lowerMessage.includes('usage')) {
        return {
          content: `**System Analytics:**\n\n**Usage Statistics**\n• Active users: 156 students\n• Daily active: 89%\n• Peak usage: 2-4 PM\n• Avg session: 45 minutes\n\n**Feature Adoption**\n• Quiz platform: 95%\n• Coding platform: 78%\n• AI chatbot: 67%\n• Voice detection: 82%\n\n**System Health**\n• Uptime: 99.8%\n• Response time: <200ms\n• Error rate: 0.2%\n\n**Recommendations**\n• Promote coding platform usage\n• Schedule maintenance during low-traffic hours\n• Consider scaling for peak times`,
          suggestions: ['Detailed metrics', 'User feedback', 'System optimization']
        };
      }
      
      // Default admin response
      return {
        content: `I can help you with:\n\n• 👥 Student performance analysis\n• 📊 Class-wide trends and insights\n• 🎯 Intervention recommendations\n• 📈 Progress tracking\n• 🔍 Identifying at-risk students\n• 💡 Best practices and strategies\n\nWhat would you like to explore?`,
        suggestions: ['Student analytics', 'Performance trends', 'Intervention strategies', 'System insights']
      };
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSend();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => {
              setIsOpen(true);
              setUnreadCount(0);
            }}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all z-50 group"
          >
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </div>
            )}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-stone-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Ask AI Assistant
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 flex flex-col ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
            } transition-all`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">AI Assistant</h3>
                  <p className="text-xs text-emerald-100">Always here to help</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      {/* Message Content */}
                      <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                        <div className={`inline-block max-w-[85%] p-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-100 text-stone-900'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        </div>
                        
                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.suggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="block text-left w-full text-xs bg-white border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 px-3 py-2 rounded-lg transition-colors text-stone-700"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-xs text-stone-400 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-stone-100 p-3 rounded-2xl">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-stone-200">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      className="flex-1 px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isTyping}
                      className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-stone-500 mt-2 text-center">
                    AI-powered assistant • Press Enter to send
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
