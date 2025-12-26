# Get ESLint output as JSON and extract errors only
$output = npx eslint . --format=json 2>&1 | Out-String

# Try to parse JSON, if it fails, show raw output
try {
    $json = $output | ConvertFrom-Json
    
    # Extract errors
    $errors = @()
    foreach ($result in $json) {
        if ($result.messages) {
            foreach ($msg in $result.messages) {
                if ($msg.severity -eq 2) {  # severity 2 = error
                    $errors += @{
                        File = $result.filePath -replace "^.*aparatus[\\\/]agenda[\\\/]agenda[\\\/]", ""
                        Line = $msg.line
                        Column = $msg.column
                        Message = $msg.message
                        Rule = $msg.ruleId
                    }
                }
            }
        }
    }
    
    # Group by file and show
    $errors | Group-Object File | ForEach-Object {
        Write-Host "=== $($_.Name) ===" -ForegroundColor Cyan
        $_.Group | ForEach-Object {
            Write-Host "  Line $($_.Line): $($_.Rule)" -ForegroundColor Yellow
            Write-Host "    $($_.Message)"
        }
    }
    
    Write-Host "`nTotal Errors: $($errors.Count)" -ForegroundColor Green
} catch {
    Write-Host "Error parsing JSON. Raw output:"
    Write-Host $output
}
