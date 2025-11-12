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
let currentStyle = 'original';

// DOM elements
const promptInput = document.getElementById('prompt-input');
const sendButton = document.getElementById('send-button');
const messagesArea = document.getElementById('messages');
const timeline = document.getElementById('timeline');
const timelineItems = document.getElementById('timeline-items');
const detailPanel = document.getElementById('detail-panel');
const detailContent = document.getElementById('detail-content');
const styleToggle = document.getElementById('style-toggle');
const styleMenu = document.getElementById('style-menu');
const currentStyleName = document.getElementById('current-style-name');

// Initialize
promptInput.addEventListener('keydown', handleInput);
sendButton.addEventListener('click', handleSend);
document.addEventListener('keydown', handleNavigation);
styleToggle.addEventListener('click', toggleStyleMenu);

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!styleToggle.contains(e.target) && !styleMenu.contains(e.target)) {
        styleMenu.style.display = 'none';
    }
});

// Style menu options
document.querySelectorAll('.style-option').forEach(option => {
    option.addEventListener('click', () => {
        const newStyle = option.dataset.style;
        changeVisualizationStyle(newStyle);
        styleMenu.style.display = 'none';
    });
});

// Auto-resize textarea
promptInput.addEventListener('input', () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = promptInput.scrollHeight + 'px';
});

function toggleStyleMenu() {
    styleMenu.style.display = styleMenu.style.display === 'none' ? 'block' : 'none';
}

function changeVisualizationStyle(newStyle) {
    currentStyle = newStyle;

    // Update selected state in menu
    document.querySelectorAll('.style-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.style === newStyle) {
            opt.classList.add('selected');
            currentStyleName.textContent = opt.textContent;
        }
    });

    // Re-render activities with new style
    if (activities.length > 0) {
        timelineItems.innerHTML = '';
        activities.forEach((activity, index) => {
            addActivityItem(activity, index);
        });

        // Restore selection if there was one
        if (selectedActivityIndex >= 0) {
            updateSelectedActivity();
        }
    }
}

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
    // V key to toggle style menu (when timeline is visible)
    if (e.key === 'v' || e.key === 'V') {
        if (timeline.style.display !== 'none') {
            e.preventDefault();
            toggleStyleMenu();
            return;
        }
    }

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
    assistantMsg.textContent = 'Process completed. Press Shift+↑ to focus timeline, then use ← → to navigate. Press Shift+↓ or Esc to return.';

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
    item.dataset.index = index;
    item.setAttribute('tabindex', '-1');

    // Style-specific rendering
    const styleConfig = getStyleConfig(activity.type, currentStyle);
    item.className = styleConfig.className;
    item.innerHTML = styleConfig.html;

    if (styleConfig.inlineStyle) {
        item.style.cssText = styleConfig.inlineStyle;
    }

    // Add separator if not first item
    if (index > 0) {
        const separator = document.createElement('span');
        separator.className = 'activity-separator';
        separator.textContent = '→';
        timelineItems.appendChild(separator);
    }

    timelineItems.appendChild(item);
}

function getStyleConfig(type, style) {
    const styleMap = {
        'original': {
            className: 'activity-item',
            html: `<span class="type">${ACTIVITIES[type].type}</span><span class="label">${ACTIVITIES[type].label}</span>`
        },
        '2char': {
            className: 'activity-item',
            html: getShortCode(type, 2),
            inlineStyle: 'min-width: 28px; justify-content: center;'
        },
        '4char': {
            className: 'activity-item',
            html: getShortCode(type, 4),
            inlineStyle: 'min-width: 44px; justify-content: center;'
        },
        '1char-color': {
            className: 'activity-item',
            html: get1CharIcon(type),
            inlineStyle: `color: ${get1CharColor(type)}; min-width: 24px; justify-content: center; font-weight: 700;`
        },
        'ascii-symbol': {
            className: 'activity-item',
            html: getASCIISymbol(type),
            inlineStyle: 'min-width: 24px; justify-content: center; font-size: 14px; font-weight: 700;'
        },
        'grid-unicode': {
            className: 'activity-item',
            html: getGridUnicode(type),
            inlineStyle: `min-width: 32px; height: 32px; justify-content: center; align-items: center; font-size: 10px; line-height: 1.2; color: ${get1CharColor(type)};`
        },
        'box-symbol': {
            className: 'activity-item',
            html: getBoxSymbol(type),
            inlineStyle: `min-width: 32px; height: 32px; justify-content: center; align-items: center; font-size: 10px; line-height: 1.2; color: ${get1CharColor(type)};`
        },
        'dot-density': {
            className: 'activity-item',
            html: getDotDensity(type),
            inlineStyle: `min-width: 32px; height: 32px; justify-content: center; align-items: center; font-size: 10px; line-height: 1.2; color: ${get1CharColor(type)};`
        },
        'geometric': {
            className: 'activity-item',
            html: getGeometric(type),
            inlineStyle: `min-width: 32px; height: 32px; justify-content: center; align-items: center; font-size: 10px; line-height: 1.2; color: ${get1CharColor(type)};`
        },
        'grid-ascii': {
            className: 'activity-item',
            html: getGridASCII(type),
            inlineStyle: `min-width: 32px; height: 32px; justify-content: center; align-items: center; font-size: 10px; line-height: 1.2; color: ${get1CharColor(type)};`
        },
        'geometric-single': {
            className: 'activity-item',
            html: getGeometricSingle(type),
            inlineStyle: `color: ${get1CharColor(type)}; min-width: 28px; justify-content: center; font-weight: bold;`
        },
        'rgb-cmy': {
            className: 'activity-item',
            html: getRGBCMY(type),
            inlineStyle: `color: ${getRGBCMYColor(type)}; min-width: 28px; justify-content: center; font-weight: bold;`
        },
        'perceptual': {
            className: 'activity-item',
            html: getPerceptual(type),
            inlineStyle: `color: ${getPerceptualColor(type)}; min-width: 28px; justify-content: center; font-weight: bold;`
        }
    };

    return styleMap[style] || styleMap['original'];
}

// Helper functions for different styles
function getShortCode(type, length) {
    const codes = {
        2: { think: 'Th', read: 'Rd', write: 'Wr', tool: 'To', decision: 'Dc', pivot: 'Pv', error: 'Er' },
        4: { think: 'THNK', read: 'READ', write: 'WRIT', tool: 'TOOL', decision: 'DCSN', pivot: 'PIVT', error: 'EROR' }
    };
    return codes[length][type] || type.substring(0, length);
}

function get1CharIcon(type) {
    const icons = { think: 'T', read: 'R', write: 'W', tool: 'T', decision: 'D', pivot: 'P', error: 'E' };
    return icons[type] || '?';
}

function get1CharColor(type) {
    const colors = {
        think: '#6ba4e7', tool: '#6dc76d', read: '#e7c76b',
        write: '#c76be7', decision: '#e78b6b', pivot: '#e76b8b', error: '#ff4444'
    };
    return colors[type] || '#cccccc';
}

function getASCIISymbol(type) {
    const symbols = { think: '?', tool: '#', read: '<', write: '>', decision: '!', pivot: '~', error: '✕' };
    return symbols[type] || '?';
}

function getGridUnicode(type) {
    const grids = {
        think: '?<br>?', tool: '╔╗<br>╚╝', read: '┌┐<br>└┘',
        write: '▐▌<br>▐▌', decision: '╱╲<br>╲╱', error: '✕<br>✕', pivot: '↻<br>↺'
    };
    return grids[type] || '?<br>?';
}

function getBoxSymbol(type) {
    const boxes = {
        think: '<br>?', tool: '[<br>#', read: '[<br><',
        write: '[<br>>', decision: '<br>!', pivot: '<br>@', error: '{<br>X'
    };
    return boxes[type] || '<br>?';
}

function getDotDensity(type) {
    const dots = {
        think: '.<br>?', tool: '*<br>#', read: '*<br><',
        write: '*<br>>', decision: '.<br>!', pivot: '.<br>@', error: '#<br>X'
    };
    return dots[type] || '.<br>?';
}

function getGeometric(type) {
    const shapes = {
        think: '/<br>\\', tool: '|<br>|', read: '-<br>-',
        write: '=<br>=', decision: '\\<br>/', pivot: '<<br>>', error: 'X<br>X'
    };
    return shapes[type] || '/<br>\\';
}

function getGridASCII(type) {
    const ascii = {
        think: '?<br>?', tool: '#<br>#', read: '<<br><',
        write: '><br>>', decision: '/<br>\\', pivot: '@<br>@', error: 'X<br>X'
    };
    return ascii[type] || '?<br>?';
}

function getGeometricSingle(type) {
    const geo = { think: '/\\', tool: '||', read: '--', write: '==', decision: '\\/', pivot: '<>', error: 'XX' };
    return geo[type] || '/\\';
}

function getRGBCMY(type) {
    return getGeometricSingle(type);
}

function getRGBCMYColor(type) {
    const colors = {
        think: '#00ffff', tool: '#ff0000', read: '#00ff00',
        write: '#0000ff', decision: '#ffff00', pivot: '#ff00ff', error: '#ffffff'
    };
    return colors[type] || '#cccccc';
}

function getPerceptual(type) {
    return getGeometricSingle(type);
}

function getPerceptualColor(type) {
    const colors = {
        think: '#4da6ff', tool: '#ff6b35', read: '#5ebd3e',
        write: '#ff4757', decision: '#ffcc00', pivot: '#9b59b6', error: '#ffffff'
    };
    return colors[type] || '#cccccc';
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
