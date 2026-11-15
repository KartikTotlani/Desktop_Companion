<#
.SYNOPSIS
  Measures aggregate CPU and private memory for Nova and ONLY Nova's own
  process tree (app exe + its msedgewebview2.exe children and their children).

.DESCRIPTION
  Nova's root process is found by its full executable path, not by name, so
  other programs called "app.exe" are ignored. Descendants are found through
  parent/child ancestry, so WebView2 processes owned by other applications
  (Teams, Outlook, etc.) are excluded.

  CPU    = sum of CPU time used by the tree, as % of TOTAL machine CPU
           (same basis as Task Manager's CPU column).
  Memory = sum of "Working Set - Private" (same basis as Task Manager's
           Memory column).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\tools\measure-nova.ps1 `
    -ExePath E:\Desktop_Companion\app\src-tauri\target\release\app.exe `
    -Seconds 60 -Label idle
#>
param(
  [Parameter(Mandatory = $true)][string]$ExePath,
  [int]$Seconds = 60,
  [string]$Label = "run"
)

$ErrorActionPreference = "Stop"
$ExePath = (Resolve-Path -LiteralPath $ExePath).Path
$cores = [Environment]::ProcessorCount
$MB = 1MB

function Get-NovaTree {
  $all = Get-CimInstance Win32_Process -Property ProcessId, ParentProcessId, ExecutablePath, Name
  $roots = @($all | Where-Object { $_.ExecutablePath -and ($_.ExecutablePath -eq $ExePath) })
  if ($roots.Count -eq 0) { return @() }

  $ids = New-Object 'System.Collections.Generic.HashSet[int]'
  $queue = New-Object 'System.Collections.Generic.Queue[int]'
  foreach ($r in $roots) {
    [void]$ids.Add([int]$r.ProcessId)
    $queue.Enqueue([int]$r.ProcessId)
  }
  while ($queue.Count -gt 0) {
    $parent = $queue.Dequeue()
    foreach ($c in @($all | Where-Object { [int]$_.ParentProcessId -eq $parent })) {
      if ($ids.Add([int]$c.ProcessId)) { $queue.Enqueue([int]$c.ProcessId) }
    }
  }
  @($all | Where-Object { $ids.Contains([int]$_.ProcessId) })
}

$tree = Get-NovaTree
if ($tree.Count -eq 0) {
  throw "No running process found with ExecutablePath = $ExePath. Start Nova from that exact exe first."
}

$prev = @{}
$last = 0.0
$rows = New-Object System.Collections.Generic.List[object]
$ids = @()
$sw = [System.Diagnostics.Stopwatch]::StartNew()
Write-Host ("Sampling '{0}' for {1}s on {2} logical cores ..." -f $Label, $Seconds, $cores)

while ($sw.Elapsed.TotalSeconds -lt $Seconds) {
  $tree = Get-NovaTree
  if ($tree.Count -eq 0) { Write-Warning "Nova exited during the measurement."; break }
  $ids = [int[]]@($tree | ForEach-Object { [int]$_.ProcessId })
  $now = $sw.Elapsed.TotalSeconds

  $cpuNow = @{}
  Get-Process -Id $ids -ErrorAction SilentlyContinue | ForEach-Object {
    try { $cpuNow[$_.Id] = $_.TotalProcessorTime.TotalSeconds } catch { }
  }

  if ($prev.Count -gt 0 -and ($now - $last) -gt 0) {
    $delta = 0.0
    foreach ($k in $cpuNow.Keys) {
      if ($prev.ContainsKey($k)) { $delta += ($cpuNow[$k] - $prev[$k]) }
    }
    $cpuPct = ($delta / ($now - $last)) / $cores * 100

    $perf = Get-CimInstance Win32_PerfFormattedData_PerfProc_Process -Property IDProcess, WorkingSetPrivate |
            Where-Object { $ids -contains [int]$_.IDProcess }
    $priv = ($perf | Measure-Object WorkingSetPrivate -Sum).Sum / $MB

    $rows.Add([pscustomobject]@{
      T         = [math]::Round($now, 1)
      CpuPct    = $cpuPct
      PrivateMB = $priv
      Procs     = $ids.Count
    })
  }

  $prev = $cpuNow
  $last = $now
  Start-Sleep -Seconds 1
}

if ($rows.Count -eq 0) { throw "No samples were collected." }

$cpu = $rows | Measure-Object CpuPct -Average -Minimum -Maximum
$mem = $rows | Measure-Object PrivateMB -Average -Minimum -Maximum
$procMax = ($rows | Measure-Object Procs -Maximum).Maximum

Write-Host ""
Write-Host ("=== {0}: {1} samples over ~{2:N0}s ===" -f $Label, $rows.Count, $sw.Elapsed.TotalSeconds)
Write-Host ("CPU (% of total machine CPU): avg {0:N2} | min {1:N2} | max {2:N2}" -f $cpu.Average, $cpu.Minimum, $cpu.Maximum)
Write-Host ("Private memory (MB, whole tree): avg {0:N1} | min {1:N1} | max {2:N1}" -f $mem.Average, $mem.Minimum, $mem.Maximum)
Write-Host ("Processes in tree (max): {0}" -f $procMax)

Write-Host "`nProcess breakdown (final sample):"
if ($ids.Count -gt 0) {
  Get-CimInstance Win32_PerfFormattedData_PerfProc_Process -Property IDProcess, Name, WorkingSetPrivate |
    Where-Object { $ids -contains [int]$_.IDProcess } |
    Sort-Object WorkingSetPrivate -Descending |
    Select-Object @{n = 'PID'; e = { $_.IDProcess } }, Name,
                  @{n = 'PrivateMB'; e = { [math]::Round($_.WorkingSetPrivate / $MB, 2) } } |
    Format-Table -AutoSize
}
