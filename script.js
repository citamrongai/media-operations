function FormatLyrics() {
    const lyricsInput = document.getElementById('InputLyrics').value;
    
    // 1. Split into lines
    let lines = lyricsInput.split('\n');

    // 2. The Purifier: Remove labels and numbers
    const cleanLines = lines
        .map(line => line.trim())
        .filter(line => {
            // Updated Regex:
            // 1. isLabel: catches "Verse", "Verse 1", "Chorus:", "1. Chorus", etc.
            const isLabel = /^(Chorus|Verse|Refrain|Bridge|Pre-Chorus|Intro|Outro|Ref|Cho)(\s*\d+[:.]?)?[:.]?$/i.test(line);
            
            // 2. isNumber: catches "1", "1.", or "1:" 
            const isNumber = /^(\d+[:.]?)$/.test(line);

            const isBracketed = /^\[.*\]$/.test(line); // catches lines like "[Chorus]" or "[Verse 1]"
            
            const isEmpty = line === '';
            
            const isWord = /^(Chorus|Verse|Refrain|Bridge|Pre-Chorus|Intro|Outro|Ref|Cho)$/i.test(line);

            return !isLabel && !isNumber && !isEmpty && !isBracketed;
        });
    
    let output = [];

    // 3. Format into 4-line blocks
    for (let i = 0; i < cleanLines.length; i++) {
        output.push(cleanLines[i]);
        
        if ((i + 1) % 4 === 0 && (i + 1) < cleanLines.length) {
            output.push('');
        }
    }
    
    document.getElementById('outputLyrics').value = output.join('\n');
}

async function copyToClipboard() {
    const outputTextarea = document.getElementById('outputLyrics');

    // 1. Select the text visually (Fixed the typo here)
    outputTextarea.select(); 
    outputTextarea.setSelectionRange(0, outputTextarea.value.length);

    // 2. Use the Clipboard API to copy the text
    try {
        await navigator.clipboard.writeText(outputTextarea.value);
        alert('Lyrics copied to clipboard! Ready for EasyWorship.');
    } catch (err) {
        // Fallback for older browsers
        document.execCommand('copy');
        alert('Lyrics copied!');
    }
}