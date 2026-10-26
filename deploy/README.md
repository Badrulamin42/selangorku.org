# Windows Nginx deployment

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
