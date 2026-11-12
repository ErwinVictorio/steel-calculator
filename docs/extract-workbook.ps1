Add-Type -AssemblyName System.IO.Compression.FileSystem
$bookPath = Join-Path (Get-Location) 'docs/NOV 2026 DAILY DELIVERY REPORT.xlsx'
$zip = [IO.Compression.ZipFile]::OpenRead($bookPath)
function Read-Entry($name) {
 $entry=$zip.GetEntry($name)
 if (!$entry) { return $null }
 $reader=[IO.StreamReader]::new($entry.Open())
 try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}
[xml]$workbook=Read-Entry 'xl/workbook.xml'
[xml]$rels=Read-Entry 'xl/_rels/workbook.xml.rels'
[xml]$stringsXml=Read-Entry 'xl/sharedStrings.xml'
$strings=@($stringsXml.sst.si | ForEach-Object { ($_.SelectNodes('.//*[local-name()="t"]') | ForEach-Object { $_.InnerText }) -join '' })
$allSheets=@()
foreach($sheet in $workbook.workbook.sheets.sheet) {
 $rid=$sheet.GetAttribute('id','http://schemas.openxmlformats.org/officeDocument/2006/relationships')
 $target=($rels.Relationships.Relationship | Where-Object {$_.Id -eq $rid}).Target
 if($target.StartsWith('/')) {$target=$target.TrimStart('/')} else {$target='xl/'+$target}
 [xml]$xml=Read-Entry $target
 $cells=[Collections.Generic.List[object]]::new(); $formulas=[Collections.Generic.List[object]]::new()
 foreach($row in $xml.worksheet.sheetData.row) {
  foreach($cell in $row.c) {
   $value=[string]$cell.v
   if($cell.t -eq 's') {$value=$strings[[int]$value]}
   if($cell.t -eq 'inlineStr') {$value=[string]$cell.is.t}
   if($cell.f) {
    $formula=$cell.f.InnerText
    if($cell.f -is [string]) {$formula=$cell.f}
    $formulas.Add(@{cell=$cell.r;formula=$formula;cached=$value;shared=$cell.f.si;range=$cell.f.ref;type=$cell.f.t})
   }
   if($value -ne '' -or $cell.f) { $cells.Add(@{cell=$cell.r;value=$value}) }
  }
 }
 $allSheets+= @{name=$sheet.name;state=$sheet.state;dimension=$xml.worksheet.dimension.ref;cells=$cells;formulas=$formulas}
 Write-Output "$($sheet.name): $($cells.Count) cells; $($formulas.Count) formulas"
}
$result=@{source='NOV 2026 DAILY DELIVERY REPORT.xlsx';definedNames=@($workbook.workbook.definedNames.definedName | ForEach-Object {@{name=$_.name;value=$_.InnerText}});sheets=$allSheets}
$result | ConvertTo-Json -Depth 12 -Compress | Set-Content -Encoding UTF8 docs/workbook-extraction.json
$zip.Dispose()
