document.addEventListener('DOMContentLoaded', () => {
    // Simulate initial loading delay to show skeleton UI
    setTimeout(() => {
        const skeleton = document.getElementById('skeleton-screen');
        const content = document.getElementById('app-content');
        
        if (skeleton && content) {
            skeleton.style.opacity = '0';
            setTimeout(() => {
                skeleton.style.display = 'none';
                content.style.visibility = 'visible';
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
            }, 500);
        }
    }, 1500);
});

function FormatLyrics() {
    const lyricsInput = document.getElementById('InputLyrics').value;
    if (!lyricsInput.trim()) return;
    
    // Split by lines, trim whitespace, and filter out empty lines
    const lines = lyricsInput.split('\n')
                             .map(line => line.trim())
                             .filter(line => line !== '');
    
    let output = [];

    for (let i = 0; i < lines.length; i++) {
        output.push(lines[i]);
        
        // Add a blank line every 4 lines to split into slides, but not after the very last line
        if ((i + 1) % 4 === 0 && (i + 1) < lines.length) {
            output.push('');
        }
    }
    
    document.getElementById('outputLyrics').value = output.join('\n');
    
    // Auto-scroll to output for better UX
    document.getElementById('outputLyrics').scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Update character counter
    updateCharCounter();
}

function copyToClipboard() {
    const outputField = document.getElementById('outputLyrics');
    if (!outputField.value) return;

    outputField.select();
    outputField.setSelectionRange(0, 99999); // For mobile devices

    try {
        navigator.clipboard.writeText(outputField.value).then(() => {
            const copyBtn = document.querySelector('.btn-secondary');
            const originalText = copyBtn.innerText;
            
            // Visual feedback for success
            copyBtn.innerText = 'Copied!';
            copyBtn.style.color = '#4ade80';
            
            setTimeout(() => {
                copyBtn.innerText = originalText;
                copyBtn.style.color = 'inherit';
            }, 2000);
        });
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

function shareToWhatsApp() {
    const outputField = document.getElementById('outputLyrics');
    if (!outputField.value.trim()) return;

    const lyrics = outputField.value;

    // 1. Check length
    if (lyrics.length > 65000) {
        document.getElementById('warningBanner').style.display = 'block';
        return;
    }

    // 2. Prepare the URL
    const encodedLyrics = encodeURIComponent(lyrics);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedLyrics}`;

    // 3. IMPLEMENT THE POPUP CHECK HERE
    const newWindow = window.open(whatsappUrl, '_blank');
    
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        alert("Popup blocked! Please allow popups for this site or manually copy the lyrics.");
    }
}

function updateCharCounter() {
    const outputField = document.getElementById('outputLyrics');
    const counter = document.getElementById('charCounter');
    const warning = document.getElementById('warningBanner');

    const length = outputField.value.length;
    counter.innerText = `Characters: ${length} / 65,000`;

    // Show warning if exceeded
    if (length > 65000) {
        if(warning) warning.style.display = 'block';
        if(counter) counter.style.color = '#ff003c';
    } else {
        if(warning) warning.style.display = 'none';
        if(counter) counter.style.color = '#b3b3b3';
    }
}
