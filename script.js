// Activity types - no emojis, CLI-compatible
const ACTIVITIES = {
    think: { type: 'THINK', label: 'analyzing request' },
    read: { type: 'READ', label: 'reading file' },
    write: { type: 'WRITE', label: 'writing changes' },
    tool: { type: 'TOOL', label: 'using tool' },
    decision: { type: 'DECISION', label: 'making decision' },
    pivot: { type: 'PIVOT', label: 'changing approach' },
    error: { type: 'ERROR', label: 'handling error' }
};

// Sample activity sequences with realistic LLM workflow snippets
const SAMPLE_ACTIVITIES = [
    {
        type: 'think',
        snippet: `Analyzing user request...

Task: "${window.currentPrompt}"

Breaking down the requirements:
1. Understand context
2. Identify resources needed
3. Plan execution steps`
    },
    {
        type: 'tool',
        snippet: `Invoking tool: FileSearch
Parameters: {
  pattern: "*.js",
  directory: "/src"
}

Searching codebase for relevant files...`
    },
    {
        type: 'read',
        snippet: `Reading file: src/components/App.js

Content loaded (2847 bytes)
Analyzing code structure...
Identifying key functions and dependencies`
    },
    {
        type: 'decision',
        snippet: `Decision Point: Approach Selection

Options evaluated:
A) Modify existing component ✓
B) Create new component
C) Refactor architecture

Selected: A - Lower risk, faster implementation`
    },
    {
        type: 'write',
        snippet: `Writing to: src/components/App.js

Changes:
+ Added error handling
+ Implemented loading state
+ Updated prop validation

Lines modified: 15-42`
    },
    {
        type: 'think',
        snippet: `Reviewing implementation...

✓ Code follows style guide
✓ Edge cases handled
✓ Performance considerations addressed
? Should we add tests?`
    },
    {
        type: 'pivot',
        snippet: `Strategy Change Detected!

Previous: Direct implementation
Current: Test-driven approach

Reason: Ensure reliability before deployment
Adjusting workflow...`
    },
    {
        type: 'tool',
        snippet: `Invoking tool: TestRunner
Command: npm test

Running test suite...
Tests: 45 passed, 2 failed`
    },
    {
        type: 'error',
        snippet: `Error Detected!

Test failures in:
- src/utils/validator.test.js:42
  Expected: true, Received: false

- src/components/Form.test.js:108
  TypeError: Cannot read property 'value' of null

Analyzing root cause...`
    },
    {
        type: 'write',
        snippet: `Fixing identified issues...

Writing to: src/utils/validator.js
- Fixed edge case in validation logic

Writing to: src/components/Form.jsx
- Added null check for form elements

Changes committed.`
    },
    {
        type: 'tool',
        snippet: `Invoking tool: TestRunner
Command: npm test

Running test suite...
Tests passed: 47/47 ✓
All tests passing!`
    }
];

// State management
let activities = [];
let selectedActivityIndex = -1;
let isProcessing = false;

// DOM elements
const promptInput = document.getElementById('prompt-input');
const sendButton = document.getElementById('send-button');
const messagesArea = document.getElementById('messages');
const timeline = document.getElementById('timeline');
const timelineItems = document.getElementById('timeline-items');
const detailPanel = document.getElementById('detail-panel');
const detailContent = document.getElementById('detail-content');

// Initialize
promptInput.addEventListener('keydown', handleInput);
sendButton.addEventListener('click', handleSend);
document.addEventListener('keydown', handleNavigation);

// Auto-resize textarea
promptInput.addEventListener('input', () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = promptInput.scrollHeight + 'px';
});

function handleInput(e) {
    if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
        e.preventDefault();
        handleSend();
    }
}

function handleSend() {
    const prompt = promptInput.value.trim();
    if (prompt && !isProcessing) {
        window.currentPrompt = prompt;
        startActivitySimulation(prompt);
    }
}

function handleNavigation(e) {
    // Shift+ArrowUp to enter timeline focus
    if (e.shiftKey && e.key === 'ArrowUp' && activities.length > 0) {
        e.preventDefault();
        enterTimelineFocus();
        return;
    }

    // Shift+ArrowDown to exit timeline focus
    if (e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault();
        exitTimelineFocus();
        return;
    }

    // Only allow navigation when timeline is focused
    if (!timeline.classList.contains('focused')) return;

    if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateActivity(1);
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateActivity(-1);
    } else if (e.key === 'Escape') {
        e.preventDefault();
        exitTimelineFocus();
    }
}

function enterTimelineFocus() {
    if (activities.length === 0) return;

    timeline.classList.add('focused');
    promptInput.blur();

    // Select first activity if none selected
    if (selectedActivityIndex === -1) {
        selectedActivityIndex = 0;
        updateSelectedActivity();
        showActivityDetail(activities[selectedActivityIndex]);
    }
}

function exitTimelineFocus() {
    timeline.classList.remove('focused');
    closeDetail();
    selectedActivityIndex = -1;
    updateSelectedActivity();
    promptInput.focus();
}

function navigateActivity(direction) {
    const newIndex = selectedActivityIndex + direction;

    if (newIndex >= 0 && newIndex < activities.length) {
        selectedActivityIndex = newIndex;
        updateSelectedActivity();
        showActivityDetail(activities[selectedActivityIndex]);
    }
}

function updateSelectedActivity() {
    const items = document.querySelectorAll('.activity-item');
    items.forEach((item, index) => {
        if (index === selectedActivityIndex) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

async function startActivitySimulation(prompt) {
    isProcessing = true;
    promptInput.disabled = true;
    sendButton.disabled = true;

    // Clear previous state
    clearActivities();

    // Add user message
    addMessage(prompt, 'user');

    // Clear input
    promptInput.value = '';
    promptInput.style.height = 'auto';

    // Add assistant response placeholder
    const assistantMsg = addMessage('Processing your request...', 'assistant');

    // Show timeline
    timeline.style.display = 'block';
    timelineItems.innerHTML = '';

    // Simulate activities one by one
    for (let i = 0; i < SAMPLE_ACTIVITIES.length; i++) {
        await sleep(600 + Math.random() * 300); // Random delay between 600-900ms

        const activity = SAMPLE_ACTIVITIES[i];
        activities.push(activity);

        addActivityItem(activity, i);
    }

    // Update final message
    assistantMsg.textContent = 'Process completed. Click on any activity above or use ← → to navigate and see details.';

    isProcessing = false;
    promptInput.disabled = false;
    sendButton.disabled = false;
    promptInput.focus();
}

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;

    messageDiv.appendChild(contentDiv);
    messagesArea.appendChild(messageDiv);

    // Auto-scroll to bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;

    return contentDiv;
}

function addActivityItem(activity, index) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.dataset.index = index;
    item.setAttribute('tabindex', '-1'); // Make focusable but not in tab order

    const typeSpan = document.createElement('span');
    typeSpan.className = 'type';
    typeSpan.textContent = ACTIVITIES[activity.type].type;

    const labelSpan = document.createElement('span');
    labelSpan.className = 'label';
    labelSpan.textContent = ACTIVITIES[activity.type].label;

    item.appendChild(typeSpan);
    item.appendChild(labelSpan);

    // Add separator if not first item
    if (index > 0) {
        const separator = document.createElement('span');
        separator.className = 'activity-separator';
        separator.textContent = '→';
        timelineItems.appendChild(separator);
    }

    timelineItems.appendChild(item);
}

function showActivityDetail(activity) {
    const activityType = ACTIVITIES[activity.type];

    detailContent.innerHTML = `<pre>${escapeHtml(activity.snippet)}</pre>`;
    detailPanel.style.display = 'block';
}

function closeDetail() {
    detailPanel.style.display = 'none';
    selectedActivityIndex = -1;
    updateSelectedActivity();
}

function clearActivities() {
    activities = [];
    selectedActivityIndex = -1;
    timelineItems.innerHTML = '';
    timeline.style.display = 'none';
    closeDetail();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize on load
window.addEventListener('load', () => {
    promptInput.focus();
});
