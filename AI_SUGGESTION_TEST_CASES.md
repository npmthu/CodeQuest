# TEST CASES - AI SUGGESTION FEATURES

---

## FEATURE 1: AI SUGGESTION IN NOTEBOOK

---

**Test Case ID:** TC-NB-01  
**Test Case Title:** Ask question in empty notebook  
**Priority:** P2 (Medium)  
**Preconditions:** User is authenticated and has opened an empty notebook  
**Test Steps:**  
1. Open notebook interface  
2. Click on "AI Assistant" panel  
3. Enter question: "What is a linked list?"  
4. Submit question  
**Expected Result:** AI generates response based on general knowledge without notebook context; response is displayed in assistant panel  
**Actual Result:**  The AI Assistant correctly answered the question “What is a linked list?” using general knowledge, without relying on any notebook context since the notebook was empty. The response included a clear definition, explanation, example code, and key characteristics of a linked list. The answer was displayed properly in the AI Assistant panel
**Status:** Pass
**All defects found (if any):** None
**Notes:** The response matches the Expected Result. The AI did not reference notebook content, and the explanation was clear, accurate, and relevant. No display or functional issues were observed

---

**Test Case ID:** TC-NB-02  
**Test Case Title:** Request AI summary of notebook with markdown and code cells  
**Priority:** P1 (High)  
**Preconditions:** User has notebook with at least 3 markdown cells and 2 code cells with content  
**Test Steps:**  
1. Navigate to notebook containing mixed content (eg, Arrays and Searching Algorithms)  
2. Open AI assistant panel  
3. Click "Request Summary" button  
4. Wait for AI processing  
**Expected Result:** AI generates concise summary covering key concepts from markdown and code; summary references notebook structure and main topics  
**Actual Result:**  The AI successfully generated a detailed and accurate summary of the notebook content. The summary covered key concepts from both the markdown explanations and the code examples, including array fundamentals, searching algorithms (linear search and binary search), and sorting algorithms (bubble sort). The response correctly reflected the main topics and demonstrated understanding of the algorithms illustrated in the code.
**Status:** Pass
**All defects found (if any):** None
**Notes:** The AI effectively integrated information from descriptive text and Python code, providing a structured summary aligned with the notebook’s main sections (overview, searching algorithms, and sorting algorithms), despite the notebook content being presented as plain text rather than explicit cells

---

**Test Case ID:** TC-NB-03  
**Test Case Title:** Request AI suggestion for specific code block in notebook  
**Priority:** P1 (High)  
**Preconditions:** User has notebook with at least one Python code cell  
**Test Steps:**  
1. Select a code cell containing Python code  
2. Right-click and select "Request AI Suggestion"  
3. Wait for response  
**Expected Result:** AI analyzes selected code and provides contextual suggestions (improvements, explanations, or alternatives); suggestions are displayed inline or in assistant panel  
**Actual Result:** The AI analyzed the selected Python code block and provided meaningful, contextual suggestions. The response included an explanation of the existing logic, recommended using Python’s built-in max() function for improved readability and efficiency, and discussed edge case handling for empty lists. An alternative, more Pythonic loop-based implementation was also suggested. The suggestions were clearly related to the selected code and were presented clearly in the assistant panel.
**Status:** Pass
**All defects found (if any):**  None
**Notes:** The AI demonstrated strong understanding of the selected code and offered practical improvements, including use of built-in functions, cleaner iteration patterns, and explicit handling of edge cases. The suggestions were relevant, actionable, and aligned with Python best practices

---

**Test Case ID:** TC-NB-04  
**Test Case Title:** Ask follow-up question in ongoing conversation  
**Priority:** P2 (Medium)  
**Preconditions:** User has already asked one question and received AI response  
**Test Steps:**  
1. Review previous AI response in assistant panel  
2. Type follow-up question: "Can you explain that in simpler terms?"  
3. Submit question  
**Expected Result:** AI maintains conversation context and provides clarification based on previous exchange; conversation history is preserved  
**Actual Result:** The AI did not maintain conversation context. Instead of simplifying the previously explained binary search algorithm, it provided a generic explanation of how to simplify concepts in general, along with an unrelated example about variables.
**Status:** Fail 
**All defects found (if any):**  - AI failed to reference or build upon the previous response.
- Loss of conversational context when handling follow-up questions.
**Notes:** The response was well-written but off-topic. The AI answered at a meta level rather than clarifying the specific concept discussed earlier.

---

**Test Case ID:** TC-NB-05  
**Test Case Title:** Request suggestion with notebook containing syntax errors  
**Priority:** P2 (Medium)  
**Preconditions:** User has notebook with code cell containing syntax errors  
**Test Steps:**  
1. Create code cell with intentional syntax error (e.g., missing parenthesis)  
2. Request AI suggestion for entire notebook  
3. Observe response  
**Expected Result:** AI identifies syntax errors and provides correction suggestions; does not crash or refuse to generate response  
**Actual Result:** The AI successfully analyzed the notebook content even though it was provided in plain-text format without distinct code cells. The AI correctly identified multiple Python syntax errors, including missing parentheses in function definitions, missing colons in control flow statements, and incorrect indentation. For each error, the AI provided clear explanations and corrected code examples without crashing or refusing to respond
**Status:** Pass 
**All defects found (if any):**  None
**Notes:** Although the notebook environment does not support structured code cells, the AI was still able to infer Python code blocks from context, accurately detect syntax and indentation errors, and provide meaningful correction suggestions with explanations. The AI maintained stability and handled malformed code gracefully.

---

**Test Case ID:** TC-NB-06  
**Test Case Title:** Submit empty question to AI assistant  
**Priority:** P3 (Low)  
**Preconditions:** User has notebook open with AI assistant panel visible  
**Test Steps:**  
1. Focus on AI assistant input field  
2. Leave field empty  
3. Click submit button  
**Expected Result:** System displays validation message: "Please enter a question"; submit button is disabled or validation prevents submission  
**Actual Result:**  When submitting an empty question, the request was sent to the backend.
However, the AI service returned a 503 Service Unavailable error indicating that the Gemini model was overloaded.
No AI response was generated.
**Status:** Blocked  
**All defects found (if any):** The failure was caused by external AI service unavailability (Gemini API overload).
**Notes:** The issue is not related to input validation or application logic.The AI service returned a 503 error due to temporary overload. Retesting is required when the AI service becomes available


---

**Test Case ID:** TC-NB-07  
**Test Case Title:** Request AI suggestion while previous request is processing  
**Priority:** P2 (Medium)  
**Preconditions:** User has submitted AI request that is currently processing  
**Test Steps:**  
1. Submit first AI question  
2. Before receiving response, attempt to submit second question  
3. Observe system behavior  
**Expected Result:** The system accepted the second request while the first request was still processing. Both AI requests were processed successfully. The first response provided a detailed and accurate code review with optimization suggestions and explanations. The second response returned a generic clarification message due to insufficient input data, which is consistent with the provided prompt.
**Status:** Pass
**All defects found (if any):**  None
**Notes:** Concurrent AI requests were handled without system instability. The generic nature of the second response was caused by limited user input rather than a loss of context or system error. The system behaved as expected under concurrent submission conditions.

---

**Test Case ID:** TC-NB-08  
**Test Case Title:** Request suggestion for notebook with 50+ cells  
**Priority:** P2 (Medium)  
**Preconditions:** User has notebook containing more than 50 cells with mixed content  
**Test Steps:**  
1. Open large notebook (50+ cells)  
2. Request AI summary or suggestion  
3. Monitor response time and content  
**Expected Result:** AI processes large notebook within acceptable timeout (≤30 seconds); generates meaningful summary covering key sections; does not timeout or fail  
**Actual Result:**  AI successfully processed the full notebook content and returned:
    - A structured summary accurately covering array definitions, searching algorithms, sorting algorithms, edge cases, and performance analysis.
    - Clear, actionable improvement suggestions including code examples, visual aids, exercises, comparative tables, and real-world use cases.
    - Response was coherent, well-organized, and relevant to the notebook content.
No timeout or system failure observed.
**Status:** Pass 
**All defects found (if any):**  None
**Notes:** Test executed using a legacy notebook editor without cell support; content was treated as a single unstructured text block. AI handled large input reliably and demonstrated strong contextual understanding. Result confirms AI suggestion feature is robust against large, unstructured notebook content and suitable for real-world learning scenarios.

---

**Test Case ID:** TC-NB-09  
**Test Case Title:** AI suggestion with special characters and code snippets in question  
**Priority:** P3 (Low)  
**Preconditions:** User has notebook open  
**Test Steps:**  
1. Open AI assistant  
2. Type question with code snippet: "How do I use `array.map()` in JavaScript?"  
3. Submit question  
**Expected Result:** AI correctly interprets code syntax in question; provides relevant explanation with code examples; special characters are properly escaped and displayed  
**Actual Result:**  AI successfully interpreted the code snippet and special characters ((), =>, []). AI returned a clear and structured explanation of Array.prototype.map(), including its purpose, syntax, callback behavior, and multiple relevant code examples demonstrating array transformation. All code snippets were rendered correctly without formatting or escaping issues.
**Status:** Pass 
**All defects found (if any):** None
**Notes:** AI response is accurate, well-structured, and suitable for beginner-level learners. Explanation correctly emphasizes that map() returns a new array and does not mutate the original array. Performance and response time were within acceptable limits.

---

**Test Case ID:** TC-NB-10  
**Test Case Title:** Request suggestion after network disconnection  
**Priority:** P1 (High)  
**Preconditions:** User is working in notebook with active network connection  
**Test Steps:**  
1. Open AI assistant panel  
2. Disconnect network (simulate offline mode)  
3. Submit AI request  
4. Observe error handling  
**Expected Result:** System displays clear error message: "Network connection required for AI features"; provides option to retry; does not crash or hang  
**Actual Result:**  After network disconnection, the AI assistant request entered a loading state and remained stuck indefinitely with no error message displayed. UI did not provide any feedback or retry option while offline. Once network connection was restored, the previously submitted request resumed processing automatically without user action.
**Status:** Fail  
**All defects found (if any):**  
    - No network error handling when connection is lost
    - UI hangs in loading state instead of failing gracefully
    - Missing user-facing error message for offline mode
    - No retry or cancel option while request is stuck
    - Request resumes implicitly after network recovery, which may confuse users
**Notes:** This is a critical UX and reliability issue for AI features. System should explicitly detect offline state, fail fast with a clear message, and require explicit user action (retry) after network reconnection instead of silently continuing a stalled request.

---

**Test Case ID:** TC-NB-11  
**Test Case Title:** AI suggestion persistence across notebook sessions  
**Priority:** P2 (Medium)  
**Preconditions:** User has received AI suggestions in previous notebook session  
**Test Steps:**  
1. Request and receive AI suggestion in notebook  
2. Close notebook  
3. Reopen same notebook  
4. Check AI assistant panel  
**Expected Result:** Previous AI conversation and suggestions are restored; conversation history is preserved and accessible  
**Actual Result:** AI assistant UI resets to initial state.Previous question and response are lost. No conversation history is restored after reload / route change / network reconnection
**Status:** Fail
**All defects found (if any):**  AI conversation state stored only in volatile UI state. No persistence mechanism (localStorage / sessionStorage / backend). Network interruption or navigation causes full AI context loss. Poor UX for learning/review workflow
**Notes:** Current behavior makes AI assistant unsuitable for long learning sessions. Users cannot revisit previous explanations or suggestions. This blocks meaningful use of AI for code review or study continuity

---

**Test Case ID:** TC-NB-12  
**Test Case Title:** Request suggestion for non-code content (diagrams, images)  
**Priority:** P3 (Low)  
**Preconditions:** User has notebook with markdown cells containing image references  
**Test Steps:**  
1. Add markdown cell with image: `![diagram](path/to/image.png)`  
2. Request AI summary of notebook  
3. Review AI response  
**Expected Result:** AI acknowledges presence of non-text content gracefully; focuses summary on text and code content; does not error on image references  
**Actual Result:**  AI ignores image content and summarizes surrounding text correctly. Image reference syntax (![diagram](...)) does not cause errors.Suggestions are based only on textual description
**Status:** Blocked  
**All defects found (if any):**  None observed. Image content is not interpreted, but handled gracefully
**Notes:** Current behavior is acceptable since AI has no image-processing capability in this context. Optional enhancement: AI could explicitly state that images are not analyzed

---

## FEATURE 2: AI SUGGESTION AFTER CODE SUBMISSION

---

**Test Case ID:** TC-SUB-01  
**Test Case Title:** Submit valid code for problem and receive AI suggestion  
**Priority:** P0 (Critical)  
**Preconditions:** User is authenticated; problem is available; problem belongs to topic and course  
**Test Steps:**  
1. Navigate to problem page  
2. Write valid solution code  
3. Submit code for evaluation  
4. Wait for submission processing  
5. View AI suggestion panel  
**Expected Result:** Code executes successfully; AI suggestion is generated after submission completes; suggestion includes code analysis, improvements, and references to problem requirements, topic, and course context  
**Actual Result:**  The submitted code executed successfully and produced the correct result. The AI generated a code review summary focusing on correctness, readability, and best practices. Since course, topic, input/output, and test case metadata were unavailable due to database issues, the AI did not reference problem-specific requirements or course context. The AI evaluated the solution as functionally correct, suggested using Python’s built-in max() function for conciseness and performance, recommended adding a docstring and type hints, and provided general improvement suggestions. No system errors or crashes occurred.
**Status:** Blocked  
**All defects found (if any):** AI suggestion does not reference problem description, course, topic, or test cases when related metadata is missing. 
**Notes:** This behavior is acceptable given the current database limitation. AI gracefully degraded to generic code review instead of failing or blocking the response. Once course/problem metadata is implemented, AI suggestions should be re-tested to verify contextual alignment with problem requirements and learning objectives.

---

**Test Case ID:** TC-SUB-02  
**Test Case Title:** Submit code with runtime error and check AI suggestion  
**Priority:** P1 (High)  
**Preconditions:** User has problem open with test cases  
**Test Steps:**  
1. Write code that produces runtime error (e.g., division by zero)  
2. Submit code  
3. Wait for execution failure  
4. Check AI suggestion content  
**Expected Result:** AI identifies runtime error; provides debugging hints; suggests corrections related to problem requirements; references common patterns from topic/course  
**Actual Result:**  
**Status:** Pass/Fail/Blocked  
**All defects found (if any):**  
**Notes:**

---

**Test Case ID:** TC-SUB-03  
**Test Case Title:** Submit code that passes some test cases but fails others  
**Priority:** P1 (High)  
**Preconditions:** Problem has multiple test cases; user has partial solution  
**Test Steps:**  
1. Write code that handles basic cases but fails edge cases  
2. Submit code  
3. Review test results (partial pass)  
4. Read AI suggestion  
**Expected Result:** AI identifies which test cases failed; provides specific guidance on edge cases; suggests improvements aligned with problem requirements and topic concepts  
**Actual Result:**  
**Status:** Pass/Fail/Blocked  
**All defects found (if any):**  
**Notes:**

---

**Test Case ID:** TC-SUB-04  
**Test Case Title:** No AI suggestion before code submission  
**Priority:** P1 (High)  
**Preconditions:** User has problem open; no code submitted yet  
**Test Steps:**  
1. Navigate to problem page  
2. Write code in editor (do not submit)  
3. Check AI suggestion panel  
**Expected Result:** AI suggestion panel displays message: "Submit your code to receive AI feedback"; no suggestion is generated until submission  
**Actual Result:**  
**Status:** Pass/Fail/Blocked  
**All defects found (if any):**  
**Notes:**

---

**Test Case ID:** TC-SUB-05  
**Test Case Title:** Submit identical code twice and verify suggestion consistency  
**Priority:** P2 (Medium)  
**Preconditions:** User has submitted code once and received AI suggestion  
**Test Steps:**  
1. Submit code for first time  
2. Receive AI suggestion  
3. Submit exact same code again  
4. Compare second AI suggestion  
**Expected Result:** AI returns cached or consistent suggestion; response is generated quickly; suggestion content is similar or references previous submission  
**Actual Result:**  
**Status:** Pass/Fail/Blocked  
**All defects found (if any):**  
**Notes:**

---

**Test Case ID:** TC-SUB-06  
**Test Case Title:** Submit code for problem in different topics and compare suggestions  
**Priority:** P2 (Medium)  
**Preconditions:** User has access to problems in different topics (e.g., Arrays, Trees)  
**Test Steps:**  
1. Submit solution for problem in "Arrays" topic  
2. Note AI suggestion content and topic references  
3. Submit solution for problem in "Trees" topic  
4. Compare AI suggestion references to topic  
**Expected Result:** AI suggestions are contextual to respective topics; each suggestion references relevant concepts from the problem's topic and course  
**Actual Result:**  
**Status:** Pass/Fail/Blocked  
**All defects found (if any):**  
**Notes:**

---

**Test Case ID:** TC-SUB-07  
**Test Case Title:** Submit code with compilation error and check AI feedback  
**Priority:** P1 (High)  
**Preconditions:** User is solving problem in compiled language (e.g., Java, C++)  
**Test Steps:**  
1. Write code with syntax/compilation error  
2. Submit code  
3. Wait for compilation failure  
4. Read AI suggestion  
**Expected Result:** System detects compilation error; AI provides syntax correction suggestions; references language-specific patterns from course material  
**Actual Result:**  
**Status:** Pass/Fail/Blocked  
**All defects found (if any):**  
**Notes:**

---

**Test Case ID:** TC-SUB-08  
**Test Case Title:** Submit optimized solution and verify AI recognizes efficiency  
**Priority:** P2 (Medium)  
**Preconditions:** User submits highly optimized solution (optimal time/space complexity)  
**Test Steps:**  
1. Write optimal solution for problem (e.g., O(n) instead of O(n²))  
2. Submit code  
3. Review AI suggestion  
**Expected Result:** AI recognizes code efficiency; provides positive feedback; may suggest minor style improvements but acknowledges optimal approach  
**Actual Result:**  
**Status:** Pass/Fail/Blocked  
**All defects found (if any):**  
**Notes:**

---

**Test Case ID:** TC-SUB-09  
**Test Case Title:** Submit code with timeout and check AI response  
**Priority:** P2 (Medium)  
**Preconditions:** Problem has execution time limit; user has inefficient solution  
**Test Steps:**  
1. Write solution with poor time complexity (e.g., O(n³) for large input)  
2. Submit code  
3. Wait for timeout error  
4. Check AI suggestion  
**Expected Result:** AI identifies performance issue; suggests algorithmic improvements; references efficient patterns from topic/course (e.g., "Consider using hash map for O(1) lookups")  
**Actual Result:**  
**Status:** Pass/Fail/Blocked  
**All defects found (if any):**  
**Notes:**

---

**Test Case ID:** TC-SUB-10  
**Test Case Title:** AI suggestion generation fails but submission succeeds  
**Priority:** P1 (High)  
**Preconditions:** Submission service is operational; AI service experiences temporary failure  
**Test Steps:**  
1. Submit valid code  
2. Code executes successfully  
3. AI service fails to generate suggestion (simulated)  
4. Observe user feedback  
**Expected Result:** Submission results are displayed normally; user receives notification: "AI suggestion unavailable - please try again later"; option to manually request suggestion later is provided  
**Actual Result:**  
**Status:** Pass/Fail/Blocked  
**All defects found (if any):**  
**Notes:**

---

**Test Case ID:** TC-SUB-11  
**Test Case Title:** Submit code in unsupported language and verify handling  
**Priority:** P3 (Low)  
**Preconditions:** Platform supports specific languages; problem allows language selection  
**Test Steps:**  
1. Attempt to submit code in language not configured for AI analysis  
2. Submit code  
3. Check AI suggestion status  
**Expected Result:** Submission executes if language is supported by execution engine; AI either generates generic suggestion or displays message: "AI suggestion not available for this language"  
**Actual Result:**  
**Status:** Pass/Fail/Blocked  
**All defects found (if any):**  
**Notes:**

---

**Test Case ID:** TC-SUB-12  
**Test Case Title:** Verify AI suggestion references problem description context  
**Priority:** P1 (High)  
**Preconditions:** Problem has detailed description with constraints and examples  
**Test Steps:**  
1. Read problem description noting specific constraints  
2. Submit code that ignores one constraint  
3. Review AI suggestion  
**Expected Result:** AI identifies violation of specific problem constraint; suggestion directly references problem requirements; provides example from problem description  
**Actual Result:**  
**Status:** Pass/Fail/Blocked  
**All defects found (if any):**  
**Notes:**

---

