// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const editorPanes = document.querySelectorAll('.editor-pane');
const deviceTabs = document.querySelectorAll('.device-tab');
const deviceFrames = document.querySelectorAll('.device-frame');
const runBtn = document.getElementById('run-btn');
const htmlCode = document.getElementById('html-code');
const cssCode = document.getElementById('css-code');
const jsCode = document.getElementById('js-code');
const desktopPreview = document.getElementById('desktop-preview');
const phonePreview = document.getElementById('phone-preview');
const tabletPreview = document.getElementById('tablet-preview');

// Tab switching functionality
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        // Remove active class from all tabs and panes
        tabBtns.forEach(t => t.classList.remove('active'));
        editorPanes.forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding pane
        btn.classList.add('active');
        document.getElementById(`${tab}-editor`).classList.add('active');
    });
});

// Device switching functionality
deviceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const device = tab.dataset.device;
        
        // Remove active class from all device tabs and frames
        deviceTabs.forEach(t => t.classList.remove('active'));
        deviceFrames.forEach(f => f.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding frame
        tab.classList.add('active');
        document.getElementById(`${device}-frame`).classList.add('active');
    });
});

// Run code functionality
function runCode() {
    const html = htmlCode.value;
    const css = cssCode.value;
    const js = jsCode.value;
    
    // Create the full HTML document
    const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preview</title>
            <style>
                ${css}
            </style>
        </head>
        <body>
            ${html}
            <script>
                try {
                    ${js}
                } catch (error) {
                    console.error('JavaScript Error:', error);
                }
            </script>
        </body>
        </html>
    `;
    
    // Update all preview frames
    updatePreview(desktopPreview, fullHTML);
    updatePreview(phonePreview, fullHTML);
    updatePreview(tabletPreview, fullHTML);
}

// Update individual preview frame
function updatePreview(iframe, content) {
    // Create a blob URL for the content
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Update iframe src
    iframe.src = url;
    
    // Clean up the blob URL after iframe loads
    iframe.onload = () => {
        URL.revokeObjectURL(url);
    };
}

// Auto-run on first load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runCode, 500); // Small delay to ensure everything is loaded
});

// Run button click handler
runBtn.addEventListener('click', runCode);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to run code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
    }
    
    // Ctrl/Cmd + 1, 2, 3 for device switching
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '3') {
        e.preventDefault();
        const deviceIndex = parseInt(e.key) - 1;
        const deviceTabs = document.querySelectorAll('.device-tab');
        if (deviceTabs[deviceIndex]) {
            deviceTabs[deviceIndex].click();
        }
    }
});

// Auto-save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('htmlCode', htmlCode.value);
    localStorage.setItem('cssCode', cssCode.value);
    localStorage.setItem('jsCode', jsCode.value);
}

function loadFromLocalStorage() {
    const savedHTML = localStorage.getItem('htmlCode');
    const savedCSS = localStorage.getItem('cssCode');
    const savedJS = localStorage.getItem('jsCode');
    
    if (savedHTML) htmlCode.value = savedHTML;
    if (savedCSS) cssCode.value = savedCSS;
    if (savedJS) jsCode.value = savedJS;
}

// Save code changes to localStorage
htmlCode.addEventListener('input', saveToLocalStorage);
cssCode.addEventListener('input', saveToLocalStorage);
jsCode.addEventListener('input', saveToLocalStorage);

// Load saved code on page load
loadFromLocalStorage();

// Handle iframe errors
function setupIframeErrorHandling(iframe) {
    iframe.addEventListener('load', () => {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.addEventListener('error', (e) => {
                console.error('Iframe error:', e);
            });
        } catch (e) {
            // Handle cross-origin errors gracefully
            console.log('Cannot access iframe content due to security restrictions');
        }
    });
}

// Setup error handling for all iframes
setupIframeErrorHandling(desktopPreview);
setupIframeErrorHandling(phonePreview);
setupIframeErrorHandling(tabletPreview);

// Function to scale mobile frames
function scaleMobileFrames() {
    const previewContainer = document.querySelector('.preview-container');
    const containerWidth = previewContainer.clientWidth - 40; // Subtract padding
    const containerHeight = previewContainer.clientHeight - 40;
    
    // Scale phone
    const phoneBody = document.querySelector('.phone-body');
    if (phoneBody) {
        const phoneWidth = 390;
        const phoneHeight = 844;
        const scaleX = containerWidth / phoneWidth;
        const scaleY = containerHeight / phoneHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up
        phoneBody.style.transform = `scale(${scale})`;
    }
    
    // Scale tablet
    const tabletBody = document.querySelector('.tablet-body');
    if (tabletBody) {
        const tabletWidth = 820;
        const tabletHeight = 1180;
        const scaleX = containerWidth / tabletWidth;
        const scaleY = containerHeight / tabletHeight;
        const scale = Math.min(scaleX, scaleY, 1);
        tabletBody.style.transform = `scale(${scale})`;
    }
}

// Resize observer for responsive preview containers
const resizeObserver = new ResizeObserver(entries => {
    scaleMobileFrames();
    for (let entry of entries) {
        const frame = entry.target;
        if (frame.classList.contains('active')) {
            const iframe = frame.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.dispatchEvent(new Event('resize'));
            }
        }
    }
});

// Observe all device frames
deviceFrames.forEach(frame => {
    resizeObserver.observe(frame);
});

// Initial scale
document.addEventListener('DOMContentLoaded', scaleMobileFrames);

// Scale on device switch
deviceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        setTimeout(scaleMobileFrames, 0);
    });
});

// Scale on window resize
window.addEventListener('resize', scaleMobileFrames);

// Theme toggle functionality (bonus feature)
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-theme');
    
    // Update button emoji based on theme
    if (body.classList.contains('light-theme')) {
        themeToggle.innerHTML = '🌙';
    } else {
        themeToggle.innerHTML = '☀️';
    }
    
    localStorage.setItem('theme', body.classList.contains('light-theme') ? 'light' : 'dark');
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
const themeToggle = document.getElementById('theme-toggle');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.innerHTML = '🌙';
} else {
    themeToggle.innerHTML = '☀️';
}
themeToggle.addEventListener('click', toggleTheme);