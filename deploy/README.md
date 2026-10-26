# Windows Nginx deployment

## Repeat site updates

On the local Windows development computer, run `npm run release` from the
repository root. It builds the site and creates a uniquely named
`selangorku-update-<build-id>.zip` in the parent `Wanprop` folder, alongside
`deploy-selangorku.bat` and `deploy-selangorku.ps1`. The ZIP excludes the
development and build caches.

Copy those three files to `C:\sites\` on the VPS, then right-click
`deploy-selangorku.bat` and choose **Run as administrator**. Keep only one
`selangorku-update-*.zip` beside the BAT, or drag the desired ZIP onto the BAT
when older releases are still present. The PowerShell script checks the new
build, swaps `.next` while the site is stopped, starts the scheduled task,
verifies port 3100, and restores the previous build if a check fails.

These are additional virtual hosts for the existing `cariproperty.my` Nginx
configuration. Put the blocks inside its `http { ... }` section; do not replace
the existing `cariproperty.my` blocks.

The site must run as a Next.js Node process because `/api/fluentform` is a
server route. On the server, build it with `npm ci` and `npm run build`, then
run `npm run start -- -H 127.0.0.1 -p 3100` under a persistent Windows service
or scheduled task. The Nginx blocks expect port 3100.

1. Check that the `rumahselangorku.online` DNS A record points to this server's
   public IP and that inbound ports 80 and 443 reach Nginx.
2. Create the dedicated ACME webroot with
   `New-Item -ItemType Directory -Force -Path 'C:\nginx\acme\rumahselangorku.online'`.
   This folder only contains certificate validation files; Nginx proxies the
   actual site to Next.js on port 3100.
3. Add `nginx-rumahselangorku-bootstrap.conf` inside the existing `http` block.
   Run `C:\nginx\nginx.exe -p C:/nginx/ -c conf/nginx.conf -t` and then
   `C:\nginx\nginx.exe -p C:/nginx/ -c conf/nginx.conf -s reload`.
4. From an elevated PowerShell prompt in the folder containing `wacs.exe`, run
   the following single command. If win-acme does not already have an ACME
   account, append `--emailaddress YOUR_EMAIL` with an address you control.

   ```powershell
   .\wacs.exe --source manual --host rumahselangorku.online --validation filesystem --webroot C:\nginx\acme\rumahselangorku.online --store pemfiles --pemfilespath C:\nginx\cert --pemfilesname rumahselangorku.online --installation script --script C:\nginx\nginx.exe --scriptparameters "-p C:/nginx/ -c conf/nginx.conf -s reload" --accepttos
   ```

5. After the certificate is issued, replace the bootstrap block with the two
   blocks from `nginx-rumahselangorku-https.conf`. Test and reload Nginx again.
6. Test `https://rumahselangorku.online/` and confirm the win-acme scheduled
   renewal task exists in Windows Task Scheduler. The script installation step
   reloads Nginx after each successful renewal.

The `www` hostname is intentionally omitted because it currently has no DNS
record. Add its DNS record, Nginx `server_name`, and win-acme `--host` value
before requesting a certificate that includes it.

## Start Next.js after a VPS restart

The temporary `npm run start` terminal process will stop when that terminal
closes or the server reboots. After deploying the build and running
`npm ci --omit=dev` in `C:\sites\selangorku-org`, use an elevated PowerShell
prompt **on the Windows server** to register an automatic startup task:

```powershell
$sitePath = 'C:\sites\selangorku-org'
$nodePath = (Get-Command node.exe).Source
$nextCli = Join-Path $sitePath 'node_modules\next\dist\bin\next'
if (-not (Test-Path -LiteralPath $nextCli)) { throw "Next.js is missing at $nextCli. Run npm ci --omit=dev first." }
$action = New-ScheduledTaskAction -Execute $nodePath -Argument "`"$nextCli`" start -H 127.0.0.1 -p 3100" -WorkingDirectory $sitePath
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew -StartWhenAvailable
Register-ScheduledTask -TaskName 'Selangorku Next.js' -Action $action -Trigger $trigger -Settings $settings -User 'SYSTEM' -RunLevel Highest
Start-ScheduledTask -TaskName 'Selangorku Next.js'
```

Check with `Get-ScheduledTask -TaskName 'Selangorku Next.js'` and
`Invoke-WebRequest http://127.0.0.1:3100 -UseBasicParsing`. Verify that the
existing Nginx installation also starts after a reboot; win-acme has its own
renewal task and does not start Nginx or Next.js.
