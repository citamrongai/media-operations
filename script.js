function FormatLyrics() {
    const lyricsInput = document.getElementById('InputLyrics').value;
    
    // 1. THIS IS THE SECRET: filter(line => line.trim() !== '') 
    // it removes any empty lines first so we start with a clean list of lyrics.
    const lines = lyricsInput.split('\n')
                             .map(line => line.trim())
                             .filter(line => line !== '');
    
    let output = [];

    for (let i = 0; i < lines.length; i++) {
        output.push(lines[i]);
        
        // Add a blank line every 4 lines, but not after the very last line
        if ((i + 1) % 4 === 0 && (i + 1) < lines.length) {
            output.push('');
        }
    }
    
    document.getElementById('outputLyrics').value = output.join('\n');
}