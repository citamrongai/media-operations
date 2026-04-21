function formatLyrics() {
    const lyricsInput = document.getElementById('InputLyrics'). value;
    const lines = input.trim().split('\n');
    let output = [];

    for (let i = 0; i < lines.length; i++) {
        output.pussh(lines[i]);
        if ((i + 1) % 4 === 0 && (i + 1) < lines.length) {
            output.push('');
        }
    }
    document.getElementById('OutputLyrics').value = output.join('\n');
}

function copyToClipboard() {
    const output =  document.getElementById('OutputLyrics');
    output.ariaSelected();
    document.execCommand('copy');
    alert('Lyrics copied to clipboard! Ready to paste into EasyWorship.');

}