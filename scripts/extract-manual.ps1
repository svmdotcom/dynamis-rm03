$docxPath = "C:\dev\dynamis\Dynamis RM 03 instructions.docx"
$outPath = "C:\dev\dynamis\scripts\manual-raw.txt"

$word = New-Object -ComObject Word.Application
$word.Visible = $false

try {
  $doc = $word.Documents.Open($docxPath)
  $text = $doc.Content.Text
  $doc.Close()
  $text | Out-File -FilePath $outPath -Encoding utf8
  Write-Host "Manual extracted to $outPath"
}
finally {
  $word.Quit()
}
