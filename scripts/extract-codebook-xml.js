const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const docxPath = path.resolve(__dirname, '..', 'POTENCY CODEBOOK.docx');
const outPath = path.join(__dirname, 'codebook-raw-xml.txt');
const ps1Path = path.join(__dirname, '_extract-xml-temp.ps1');

// Split by closing tags — avoids complex regex / dotall issues in PowerShell
const ps1 = `
Add-Type -Assembly System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead('${docxPath.replace(/\\/g, '\\\\').replace(/'/g, "''")}')
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$stream = $entry.Open()
$reader = [IO.StreamReader]::new($stream, [Text.Encoding]::UTF8)
$raw = $reader.ReadToEnd()
$reader.Dispose(); $stream.Dispose(); $zip.Dispose()

$lines = [System.Collections.Generic.List[string]]::new()

foreach ($trChunk in ($raw -split '</w:tr>')) {
    if (-not $trChunk.Contains('<w:tr')) { continue }
    $cells = [System.Collections.Generic.List[string]]::new()

    foreach ($tcChunk in ($trChunk -split '</w:tc>')) {
        if (-not $tcChunk.Contains('<w:tc')) { continue }
        $idx = $tcChunk.LastIndexOf('<w:tc')
        $cellContent = $tcChunk.Substring($idx)
        $texts = [regex]::Matches($cellContent, '<w:t[^>]*>([^<]*)</w:t>') | ForEach-Object { $_.Groups[1].Value }
        $cellText = ($texts -join '').Trim()
        if ($cellText -ne '') { $cells.Add($cellText) }
    }

    if ($cells.Count -gt 0) { $lines.Add(($cells -join "\`t")) }
}

[IO.File]::WriteAllLines('${outPath.replace(/\\/g, '\\\\').replace(/'/g, "''")}', $lines, [Text.Encoding]::UTF8)
Write-Host "Extracted $($lines.Count) rows"
`;

fs.writeFileSync(ps1Path, ps1, 'utf8');
try {
  execFileSync('powershell', ['-File', ps1Path], { stdio: 'inherit' });
} finally {
  if (fs.existsSync(ps1Path)) fs.unlinkSync(ps1Path);
}

const lines = fs.readFileSync(outPath, 'utf8').split('\n').map(l => l.trimEnd()).filter(Boolean);
console.log(`\nTotal rows: ${lines.length}`);

console.log('\nFirst 50 rows:');
lines.slice(0, 50).forEach((l, i) => console.log(`  [${i}] ${l}`));

const searches = ['Tabacum', 'Ferrum', 'Mag Phos', 'Nat Mur', 'Zinc', 'Magnesium', 'Vitamin', 'Giardia'];
searches.forEach(term => {
  const hits = lines.filter(l => l.toLowerCase().includes(term.toLowerCase()));
  console.log(`\nSearch "${term}" → ${hits.length} hit(s):`);
  hits.slice(0, 5).forEach(l => console.log(`  ${l}`));
  if (hits.length > 5) console.log(`  ... and ${hits.length - 5} more`);
});
