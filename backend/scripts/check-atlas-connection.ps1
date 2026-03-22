# Quick check: can this PC reach MongoDB Atlas on port 27017?
# Run from repo:  cd backend  ;  powershell -ExecutionPolicy Bypass -File .\scripts\check-atlas-connection.ps1

$hosts = @(
  "ac-oh2yose-shard-00-00.lvwughp.mongodb.net",
  "ac-oh2yose-shard-00-01.lvwughp.mongodb.net",
  "ac-oh2yose-shard-00-02.lvwughp.mongodb.net"
)

Write-Host "`n=== Atlas TCP 27017 reachability ===" -ForegroundColor Cyan
foreach ($h in $hosts) {
  Write-Host "`nTesting $h ..." -ForegroundColor Yellow
  $r = Test-NetConnection -ComputerName $h -Port 27017 -WarningAction SilentlyContinue
  if ($r.TcpTestSucceeded) {
    Write-Host "  OK: TcpTestSucceeded = True" -ForegroundColor Green
  } else {
    Write-Host "  FAIL: TcpTestSucceeded = False (blocked network / firewall / Atlas IP list)" -ForegroundColor Red
    Write-Host "  PingSucceeded: $($r.PingSucceeded)  TcpTestSucceeded: $($r.TcpTestSucceeded)"
  }
}

Write-Host "`nIf all three FAIL:" -ForegroundColor Cyan
Write-Host "  1) Atlas -> Network Access -> Add IP (or 0.0.0.0/0 for dev)"
Write-Host "  2) Disable VPN / try phone hotspot"
Write-Host "  3) Allow outbound TCP 27017 in Windows Firewall / corporate Wi-Fi"
Write-Host ""
