'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import styles from './styles.module.css';

// HighlightedText component
const HighlightedText = ({ text, highlights }: { text: string; highlights: { start: number; end: number }[] }) => {
  if (!highlights || highlights.length === 0) return <>{text}</>;

  const parts: JSX.Element[] = [];
  let lastIndex = 0;

  highlights.forEach(({ start, end }, i) => {
    // Add non-highlighted text
    if (start > lastIndex) {
      parts.push(<span key={`text-${i}`}>{text.slice(lastIndex, start)}</span>);
    }
    // Add highlighted text
    parts.push(
      <mark key={`highlight-${i}`} className={styles.highlight}>
        {text.slice(start, end)}
      </mark>
    );
    lastIndex = end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key="text-end">{text.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
};

export default function OmniswitcherToggle() {
  const [query, setQuery] = useState<string>('');
  const [committedQuery, setCommittedQuery] = useState<string>(''); // Query shown in results page
  const [isAIMode, setIsAIMode] = useState(false);
  const [committedIsAIMode, setCommittedIsAIMode] = useState(false); // Mode for results page
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Natural language detection patterns
  const NL_PATTERNS = {
    QUESTIONS: /^(what|where|when|why|who|how|can|could|would|will|should|is|are|do|does|did|has|have|had)/i,
    COMMANDS: /^(find|search|show|tell|help|get|create|make|write|draft|analyze|explain|suggest)/i,
    PRONOUNS: /\b(me|my|i|we|our|us|you|your)\b/i,
  };

  // Function to detect if text is likely natural language
  const isNaturalLanguage = (text: string): boolean => {
    if (!text.trim()) return false;
    
    const isQuestion = NL_PATTERNS.QUESTIONS.test(text);
    const isCommand = NL_PATTERNS.COMMANDS.test(text);
    const hasPronouns = NL_PATTERNS.PRONOUNS.test(text);
    const words = text.trim().split(/\s+/);
    const isLongEnough = words.length >= 3;
    
    if (isQuestion || isCommand) return true;
    if (hasPronouns && isLongEnough) return true;
    
    return false;
  };

  // Simulated search results with typeahead
  const getTypeaheadResults = (query: string): SearchResult[] => {
    if (!query) return [];
    
    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [
      // Channels
      {
        type: 'channel',
        icon: '#',
        content: '#engineering',
        subtext: '843 members',
        highlights: [],
      },
      {
        type: 'channel',
        icon: '#',
        content: '#design-team',
        subtext: '156 members',
        highlights: [],
      },
      {
        type: 'channel',
        icon: '#',
        content: '#product',
        subtext: '392 members',
        highlights: [],
      },
      {
        type: 'channel',
        icon: '#',
        content: '#random',
        subtext: '1,024 members',
        highlights: [],
      },
      // Direct Messages
      {
        type: 'user',
        icon: '👤',
        content: 'Sarah Parker',
        subtext: 'Software Engineer • Online',
        highlights: [],
      },
      {
        type: 'user',
        icon: '👤',
        content: 'Alex Thompson',
        subtext: 'Product Manager • Away',
        highlights: [],
      },
      {
        type: 'user',
        icon: '👤',
        content: 'Maria Garcia',
        subtext: 'Design Lead • In a meeting',
        highlights: [],
      },
      // Recent Messages
      {
        type: 'message',
        icon: '💬',
        content: 'Updated the design system documentation with new component guidelines',
        subtext: 'in #design-team • 2h ago',
        highlights: [],
      },
      {
        type: 'message',
        icon: '💬',
        content: 'Sprint planning meeting notes from yesterday',
        subtext: 'in #engineering • 1d ago',
        highlights: [],
      },
      {
        type: 'message',
        icon: '💬',
        content: 'Q4 roadmap discussion highlights',
        subtext: 'in #product • 2d ago',
        highlights: [],
      },
      // Files
      {
        type: 'file',
        icon: '📄',
        content: 'Design System Guidelines.pdf',
        subtext: 'Shared in #design-team • 3d ago',
        highlights: [],
      },
      {
        type: 'file',
        icon: '📄',
        content: 'Q4_Product_Roadmap.xlsx',
        subtext: 'Shared in #product • 1w ago',
        highlights: [],
      },
      {
        type: 'file',
        icon: '📄',
        content: 'Engineering_Architecture_Diagram.png',
        subtext: 'Shared in #engineering • 2w ago',
        highlights: [],
      },
      {
        type: 'file',
        icon: '📄',
        content: 'Team_Offsite_Photos.zip',
        subtext: 'Shared in #random • 3w ago',
        highlights: [],
      }
    ];

    // Filter results based on query
    return results.filter(result => {
      const contentMatch = result.content.toLowerCase().includes(lowerQuery);
      const subtextMatch = result.subtext && result.subtext.toLowerCase().includes(lowerQuery);
      
      // Special handling for channel searches
      if (result.type === 'channel') {
        // Allow searching with or without the # prefix
        const channelName = result.content.substring(1).toLowerCase();
        return lowerQuery.startsWith('#') 
          ? result.content.toLowerCase().includes(lowerQuery)
          : channelName.includes(lowerQuery);
      }
      
      return contentMatch || subtextMatch;
    }).map((result): SearchResult => {
      // Update highlight positions based on actual match
      const newResult = { ...result };
      
      // Only set highlights for the first matching field
      if (result.content.toLowerCase().includes(lowerQuery)) {
        const matchIndex = result.content.toLowerCase().indexOf(lowerQuery);
        newResult.highlights = [{ start: matchIndex, end: matchIndex + lowerQuery.length }];
      } else if (result.subtext?.toLowerCase().includes(lowerQuery)) {
        const matchIndex = result.subtext.toLowerCase().indexOf(lowerQuery);
        newResult.highlights = [{ start: matchIndex, end: matchIndex + lowerQuery.length }];
      } else {
        newResult.highlights = [];
      }

      return newResult;
    });
  };

  // Personalized suggestions
  const recommendedQueries: SearchResult[] = [
    {
      type: 'suggestion',
      icon: '✨',
      content: 'Show me recent API discussions',
      subtext: 'Find recent messages about APIs across channels',
    },
    {
      type: 'suggestion',
      icon: '✨',
      content: 'Summarize sprint planning decisions',
      subtext: 'Get key points from recent planning meetings',
    },
    {
      type: 'suggestion',
      icon: '✨',
      content: 'Find code review feedback',
      subtext: 'Collect recent code review comments',
    },
  ];

  const recentSearches: SearchResult[] = [
    {
      type: 'recent',
      icon: '🕐',
      content: '"deployment issues"',
      subtext: 'in #engineering • 2h ago',
    },
    {
      type: 'recent',
      icon: '🕐',
      content: 'from:sarah standup updates',
      subtext: 'in #team-updates • 1d ago',
    },
    {
      type: 'recent',
      icon: '🕐',
      content: 'has:link documentation',
      subtext: 'in #engineering-docs • 3d ago',
    },
  ];

  // Handle query changes with automatic mode detection (but no page switching)
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (newQuery.trim()) {
      // Automatic mode detection for visual feedback
      const shouldBeAIMode = isNaturalLanguage(newQuery);
      if (shouldBeAIMode !== isAIMode) {
        setIsAIMode(shouldBeAIMode);
      }
      // Update search results
      setSearchResults(getTypeaheadResults(newQuery));
    } else {
      setSearchResults([]);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setSearchResults([]);
    // Don't reset showResults or committedQuery - user might want to go back to search
  };

  const handleModeToggle = () => {
    setIsAIMode(!isAIMode);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <Link href="/" className={styles.backButton}>←</Link>
      </div>
      <div className={styles.slackInterface}>
        <div className={styles.topHeader}></div>
        
        <div className={styles.searchBarContainer}>
          <div className={`${styles.searchContainer} ${isOpen ? styles.searchContainerOpen : ''}`}>
            <div className={`${styles.searchHeader} ${isOpen ? styles.searchHeaderOpen : ''}`}>
              <div className={`${styles.searchInput} ${isOpen ? styles.searchInputOpen : ''}`}>
                {!isOpen ? (
                  <div className={styles.iconContainer}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </div>
                ) : (
                  <div className={styles.toggleContainer} onClick={handleModeToggle}>
                    <div className={`${styles.toggleBackground} ${isAIMode ? styles.toggleBackgroundAI : ''}`}></div>
                    <div className={styles.toggleIconContainer}>
                      <svg width={16} height={16} viewBox="0 0 17 17" fill="none">
                        <path
                          d="M7.5 0C11.6421 0 15 3.35786 15 7.5C15 9.30091 14.3636 10.9522 13.3057 12.2451L16.7803 15.7197C17.0732 16.0126 17.0732 16.4874 16.7803 16.7803C16.4874 17.0732 16.0126 17.0732 15.7197 16.7803L12.2451 13.3057C10.9522 14.3636 9.30091 15 7.5 15C3.35786 15 0 11.6421 0 7.5C0 3.35786 3.35786 0 7.5 0ZM7.5 1.5C4.18629 1.5 1.5 4.18629 1.5 7.5C1.5 10.8137 4.18629 13.5 7.5 13.5C10.8137 13.5 13.5 10.8137 13.5 7.5C13.5 4.18629 10.8137 1.5 7.5 1.5Z"
                          fill="#454447"
                        />
                      </svg>
                    </div>
                    <div className={styles.toggleIconContainer}>
                      <svg width={16} height={16} viewBox="0 0 18 18" fill="none">
                        <path
                          d="M9 0C9.35713 4.89462e-07 9.81141 0.21914 9.93652 0.714844L9.95703 0.817383L10.126 1.86523C10.5255 4.15724 10.9857 5.40563 11.79 6.20996C12.7093 7.12918 14.2084 7.59965 17.1826 8.04297C17.7508 8.12765 18 8.61913 18 9C18 9.38087 17.7508 9.87236 17.1826 9.95703C14.2083 10.4003 12.7093 10.8708 11.79 11.79C10.8708 12.7093 10.4003 14.2083 9.95703 17.1826C9.87235 17.7508 9.38087 18 9 18C8.61913 18 8.12765 17.7508 8.04297 17.1826C7.59968 14.2083 7.12918 12.7093 6.20996 11.79C5.29073 10.8708 3.79168 10.4003 0.817383 9.95703C0.249218 9.87236 4.92701e-06 9.38087 0 9C1.68769e-07 8.61913 0.249225 8.12765 0.817383 8.04297L1.86523 7.87402C4.15724 7.47447 5.40563 7.01428 6.20996 6.20996C7.1292 5.29073 7.59968 3.79163 8.04297 0.817383L8.06348 0.714844C8.18859 0.21914 8.64287 -1.37701e-07 9 0ZM9 3.81738C8.6267 5.29653 8.11686 6.42416 7.27051 7.27051C6.42416 8.11685 5.29655 8.62669 3.81738 9C5.29656 9.37328 6.42415 9.88314 7.27051 10.7295C8.11668 11.5757 8.62672 12.7029 9 14.1816C9.37328 12.7029 9.88332 11.5757 10.7295 10.7295C11.5757 9.88331 12.7029 9.37326 14.1816 9C12.7029 8.62671 11.5757 8.11667 10.7295 7.27051C9.88314 6.42416 9.3733 5.29653 9 3.81738Z"
                          fill={isAIMode ? "#ffffff" : "#454447"}
                        />
                      </svg>
                    </div>
                  </div>
                )}
                <input
                  ref={inputRef}
                  placeholder={isAIMode ? "Ask for anything" : "Search everywhere"}
                  value={query}
                  onChange={handleQueryChange}
                  onFocus={handleInputFocus}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && query.trim()) {
                      // Commit the query and mode for results page
                      setCommittedQuery(query);
                      setCommittedIsAIMode(isAIMode);
                      setShowResults(true);
                      setIsOpen(false);
                      // Remove focus from search input
                      if (inputRef.current) {
                        inputRef.current.blur();
                      }
                    }
                  }}
                  className={styles.input}
                />
              </div>
              {isOpen && (
                <button onClick={handleClose} className={styles.closeButton}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            {isOpen && !query && (
              <div className={styles.resultsContainer}>
                <div className={styles.suggestionCategory}>Recommended for you</div>
                {recommendedQueries.map((item, index) => (
                  <div key={`suggestion-${index}`} className={styles.resultItem}>
                    <div className={styles.resultIcon}>{item.icon}</div>
                    <div className={styles.resultContent}>
                      <div className={styles.resultTitle}>{item.content}</div>
                      {item.subtext && <div className={styles.resultSubtext}>{item.subtext}</div>}
                    </div>
                  </div>
                ))}

                <div className={styles.suggestionCategory}>Recent Searches</div>
                {recentSearches.map((item, index) => (
                  <div key={`recent-${index}`} className={styles.resultItem}>
                    <div className={styles.resultIcon}>{item.icon}</div>
                    <div className={styles.resultContent}>
                      <div className={styles.resultTitle}>{item.content}</div>
                      {item.subtext && <div className={styles.resultSubtext}>{item.subtext}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isOpen && query && (
              <div className={styles.resultsContainer}>
                {/* Query Echo */}
                <div className={styles.queryEcho}>
                  <div className={isAIMode ? styles.queryEchoIcon : styles.queryEchoIconSearch}>
                    {isAIMode ? (
                      <svg width={16} height={16} viewBox="0 0 18 18" fill="none">
                        <path
                          d="M9 0C9.35713 4.89462e-07 9.81141 0.21914 9.93652 0.714844L9.95703 0.817383L10.126 1.86523C10.5255 4.15724 10.9857 5.40563 11.79 6.20996C12.7093 7.12918 14.2084 7.59965 17.1826 8.04297C17.7508 8.12765 18 8.61913 18 9C18 9.38087 17.7508 9.87236 17.1826 9.95703C14.2083 10.4003 12.7093 10.8708 11.79 11.79C10.8708 12.7093 10.4003 14.2083 9.95703 17.1826C9.87235 17.7508 9.38087 18 9 18C8.61913 18 8.12765 17.7508 8.04297 17.1826C7.59968 14.2083 7.12918 12.7093 6.20996 11.79C5.29073 10.8708 3.79168 10.4003 0.817383 9.95703C0.249218 9.87236 4.92701e-06 9.38087 0 9C1.68769e-07 8.61913 0.249225 8.12765 0.817383 8.04297L1.86523 7.87402C4.15724 7.47447 5.40563 7.01428 6.20996 6.20996C7.1292 5.29073 7.59968 3.79163 8.04297 0.817383L8.06348 0.714844C8.18859 0.21914 8.64287 -1.37701e-07 9 0ZM9 3.81738C8.6267 5.29653 8.11686 6.42416 7.27051 7.27051C6.42416 8.11685 5.29655 8.62669 3.81738 9C5.29656 9.37328 6.42415 9.88314 7.27051 10.7295C8.11668 11.5757 8.62672 12.7029 9 14.1816C9.37328 12.7029 9.88332 11.5757 10.7295 10.7295C11.5757 9.88331 12.7029 9.37326 14.1816 9C12.7029 8.62671 11.5757 8.11667 10.7295 7.27051C9.88314 6.42416 9.3733 5.29653 9 3.81738Z"
                          fill="currentColor"
                        />
                      </svg>
                    ) : (
                      <svg width={16} height={16} viewBox="0 0 17 17" fill="none">
                        <path
                          d="M7.5 0C11.6421 0 15 3.35786 15 7.5C15 9.30091 14.3636 10.9522 13.3057 12.2451L16.7803 15.7197C17.0732 16.0126 17.0732 16.4874 16.7803 16.7803C16.4874 17.0732 16.0126 17.0732 15.7197 16.7803L12.2451 13.3057C10.9522 14.3636 9.30091 15 7.5 15C3.35786 15 0 11.6421 0 7.5C0 3.35786 3.35786 0 7.5 0ZM7.5 1.5C4.18629 1.5 1.5 4.18629 1.5 7.5C1.5 10.8137 4.18629 13.5 7.5 13.5C10.8137 13.5 13.5 10.8137 13.5 7.5C13.5 4.18629 10.8137 1.5 7.5 1.5Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </div>
                  <div className={styles.queryEchoContent}>
                    {query}
                  </div>
                </div>
                
                {/* Results */}
                {searchResults.map((result, index) => (
                  <div key={`result-${index}`} className={styles.resultItem}>
                    <div className={styles.resultIcon}>{result.icon}</div>
                    <div className={styles.resultContent}>
                      <div className={styles.resultTitle}>
                        <HighlightedText 
                          text={result.content}
                          highlights={result.highlights || []}
                        />
                      </div>
                      {result.subtext && (
                        <div className={styles.resultSubtext}>
                          <HighlightedText 
                            text={result.subtext}
                            highlights={result.highlights || []}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.contentLayout}>
          <div className={styles.sidebar}>
            <div className={styles.workspaceHeader}>
              <div className={styles.workspaceName}>Omniswitcher</div>
            </div>
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarHeader}>Channels</div>
              <div className={styles.sidebarItem}>
                <span>#general</span>
              </div>
            </div>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.mainHeader}>
              <div className={styles.channelName}>#general</div>
            </div>
            <div className={styles.mainArea}>
              {!showResults ? (
                <div className={styles.welcomeMessage}>
                  <h2>🔍 Omniswitcher Toggle Prototype</h2>
                  <p>This prototype demonstrates an intelligent search interface that automatically switches between AI and traditional search modes based on your input.</p>
                  
                  <div className={styles.featureList}>
                    <h3>Features:</h3>
                    <ul>
                      <li><strong>Smart Mode Detection:</strong> Automatically detects natural language queries and switches to AI mode</li>
                      <li><strong>Toggle Control:</strong> Manual toggle between search modes with smooth animations</li>
                      <li><strong>Live Typeahead:</strong> Real-time search suggestions as you type</li>
                      <li><strong>Contextual Results:</strong> Different result formats for AI vs traditional search</li>
                    </ul>
                  </div>
                  
                  <div className={styles.instructions}>
                    <h3>Try it out:</h3>
                    <p>Click on the search bar above and try typing:</p>
                    <ul>
                      <li>"What are the recent API discussions?" - <em>Should switch to AI mode</em></li>
                      <li>"engineering" - <em>Should stay in search mode</em></li>
                      <li>"design" - <em>Try typing to see typeahead suggestions</em></li>
                    </ul>
                  </div>
                </div>
              ) : committedIsAIMode ? (
                <div className={styles.aiResultsPage}>
                  <div className={styles.conversationContainer}>
                    <div className={styles.userMessage}>
                      <img 
                        src="https://i.pravatar.cc/100?img=8" 
                        alt="Carmen Vega" 
                        className={styles.avatar}
                      />
                      <div className={styles.userMessageContent}>
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>Carmen Vega</div>
                          <div className={styles.timestamp}>10:58 AM</div>
                        </div>
                        <div className={styles.question}>{committedQuery}</div>
                      </div>
                    </div>

                    <div className={styles.aiResponse}>
                      <div className={styles.aiAvatar}>A</div>
                      <div className={styles.aiContent}>
                        <div className={styles.aiName}>Agentforce</div>
                        <div className={styles.resultsCount}>37k Search Results</div>
                        
                        <p>There are currently two main issues with the {committedQuery.includes('Acme') ? 'Acme' : 'requested'} account:</p>

                        <ul>
                          <li>
                            <strong>User Management Issue:</strong> An engineering subsidiary is trying to add users who are already assigned to the main organization. They want these users removed from the main org so they can fully manage them. Support suggested adding them as external users as a workaround, but they don't want this solution as it "creates a risk" for them.
                          </li>
                          
                          <li>
                            <strong>Redirect Issue:</strong> There's a problem with app download links. When users click on certain URLs, they're being redirected to regional websites based on geolocation. The customer wants users to remain on the original URL without redirection. Technical investigation shows this is happening at multiple redirect stages.
                          </li>
                        </ul>

                        <p>Additionally, there was a note about certificate pinning being phased out on APIs after May 30th. The team had discussions to clarify this change.</p>

                        <div className={styles.followUps}>
                          <div className={styles.followUpLabel}>Suggested Followups</div>
                          <button className={styles.followUpButton}>Tell me about the deployment strategy</button>
                          <button className={styles.followUpButton}>What's the current blocking issue?</button>
                        </div>

                        <div className={styles.inputBox}>
                          <button className={styles.iconButton}>
                            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                          <input placeholder="Ask a follow-up..." className={styles.followUpInput} />
                          <button className={styles.iconButton}>
                            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 1L22 8V16L12 23L2 16V8L12 1Z"></path>
                              <path d="M8 12L12 16L16 12"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.traditionalResultsPage}>
                  <div className={styles.resultsList}>
                    <div className={styles.messageResult}>
                      <div className={styles.messageHeader}>
                        <img 
                          src="https://i.pravatar.cc/100?img=1" 
                          alt="Geeta Joshi" 
                          className={styles.avatar}
                        />
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>Geeta Joshi</div>
                          <div className={styles.tag}>#project-beta</div>
                          <div className={styles.timestamp}>May 23rd at 9:00 AM</div>
                        </div>
                      </div>
                      <div className={styles.messageContent}>
                        Excited to get started on Project Beta! As promised, here are some materials we'd like you all to read before tomorrow's kickoff.
                      </div>
                      <div className={styles.messageFooter}>
                        <div className={styles.threadInfo}>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"></path>
                          </svg>
                          1 reply
                        </div>
                        <div className={styles.reactions}>
                          <div className={styles.reaction}>
                            <span>👍</span>
                            <span>1</span>
                          </div>
                          <div className={styles.reaction}>
                            <span>🎉</span>
                            <span>3</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.messageResult}>
                      <div className={styles.messageHeader}>
                        <img 
                          src="https://i.pravatar.cc/100?img=2" 
                          alt="Emily Nishino" 
                          className={styles.avatar}
                        />
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>Emily Nishino</div>
                          <div className={styles.tag}>#project-beta</div>
                          <div className={styles.timestamp}>May 22nd at 3:15 PM</div>
                        </div>
                      </div>
                      <div className={styles.messageContent}>
                        Just finished the Project Beta extension proposal. Key points: $4.3M opportunity, focusing on user lifecycle optimization.
                      </div>
                      <div className={styles.messageFooter}>
                        <div className={styles.threadInfo}>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"></path>
                          </svg>
                          3 replies
                        </div>
                        <div className={styles.reactions}>
                          <div className={styles.reaction}>
                            <span>🚀</span>
                            <span>2</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.messageResult}>
                      <div className={styles.messageHeader}>
                        <img 
                          src="https://i.pravatar.cc/100?img=3" 
                          alt="Alex Thompson" 
                          className={styles.avatar}
                        />
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>Alex Thompson</div>
                          <div className={styles.tag}>#engineering</div>
                          <div className={styles.timestamp}>May 21st at 11:30 AM</div>
                        </div>
                      </div>
                      <div className={styles.messageContent}>
                        Project Beta deployment schedule is now finalized. Please review the timeline and let me know if you spot any conflicts.
                      </div>
                      <div className={styles.messageFooter}>
                        <div className={styles.threadInfo}>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"></path>
                          </svg>
                          5 replies
                        </div>
                        <div className={styles.reactions}>
                          <div className={styles.reaction}>
                            <span>👀</span>
                            <span>4</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.messageResult}>
                      <div className={styles.messageHeader}>
                        <img 
                          src="https://i.pravatar.cc/100?img=4" 
                          alt="Sarah Chen" 
                          className={styles.avatar}
                        />
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>Sarah Chen</div>
                          <div className={styles.tag}>#design-team</div>
                          <div className={styles.timestamp}>May 20th at 2:45 PM</div>
                        </div>
                      </div>
                      <div className={styles.messageContent}>
                        Updated the Project Beta design system with new component guidelines. Check out the Figma file for the latest changes.
                      </div>
                      <div className={styles.messageFooter}>
                        <div className={styles.threadInfo}>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"></path>
                          </svg>
                          2 replies
                        </div>
                        <div className={styles.reactions}>
                          <div className={styles.reaction}>
                            <span>💯</span>
                            <span>3</span>
                          </div>
                          <div className={styles.reaction}>
                            <span>🎨</span>
                            <span>2</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.messageResult}>
                      <div className={styles.messageHeader}>
                        <img 
                          src="https://i.pravatar.cc/100?img=5" 
                          alt="Marcus Rodriguez" 
                          className={styles.avatar}
                        />
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>Marcus Rodriguez</div>
                          <div className={styles.tag}>#product</div>
                          <div className={styles.timestamp}>May 19th at 4:20 PM</div>
                        </div>
                      </div>
                      <div className={styles.messageContent}>
                        Project Beta Q4 roadmap is ready for review. Major focus areas: user onboarding optimization and enterprise feature set.
                      </div>
                      <div className={styles.messageFooter}>
                        <div className={styles.threadInfo}>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"></path>
                          </svg>
                          4 replies
                        </div>
                        <div className={styles.reactions}>
                          <div className={styles.reaction}>
                            <span>📈</span>
                            <span>5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}