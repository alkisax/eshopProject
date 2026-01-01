root@haveanidea:/var/www/eshop/backend# pm2 list
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ eshop-backend      │ fork     │ 811  │ online    │ 0%       │ 133.0mb  │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
root@haveanidea:/var/www/eshop/backend# pm2 show eshop-backend
 Describing process with id 0 - name eshop-backend 
┌───────────────────┬────────────────────────────────────────────┐
│ status            │ online                                     │
│ name              │ eshop-backend                              │
│ namespace         │ default                                    │
│ version           │ 1.0.0                                      │
│ restarts          │ 811                                        │
│ uptime            │ 90m                                        │
│ script path       │ /var/www/eshop/backend/build/src/server.js │
│ script args       │ N/A                                        │
│ error log path    │ /root/.pm2/logs/eshop-backend-error.log    │
│ out log path      │ /root/.pm2/logs/eshop-backend-out.log      │
│ pid path          │ /root/.pm2/pids/eshop-backend-0.pid        │
│ interpreter       │ node                                       │
│ interpreter args  │ N/A                                        │
│ script id         │ 0                                          │
│ exec cwd          │ /var/www/eshop/backend                     │
│ exec mode         │ fork_mode                                  │
│ node.js version   │ 20.19.6                                    │
│ node env          │ production                                 │
│ watch & reload    │ ✘                                          │
│ unstable restarts │ 0                                          │
│ created at        │ 2026-01-01T09:55:52.917Z                   │
└───────────────────┴────────────────────────────────────────────┘
 Actions available 
┌────────────────────────┐
│ km:heapdump            │
│ km:cpu:profiling:start │
│ km:cpu:profiling:stop  │
│ km:heap:sampling:start │
│ km:heap:sampling:stop  │
└────────────────────────┘
 Trigger via: pm2 trigger eshop-backend <action_name>

 Code metrics value 
┌────────────────────────┬───────────────────────┐
│ Used Heap Size         │ 61.72 MiB             │
│ Heap Usage             │ 90.99 %               │
│ Heap Size              │ 67.82 MiB             │
│ Event Loop Latency p95 │ 1.15 ms               │
│ Event Loop Latency     │ 0.37 ms               │
│ Active handles         │ 15                    │
│ Active requests        │ 0                     │
│ HTTP                   │ 0 req/min             │
│ HTTP P95 Latency       │ 312.69999999999914 ms │
│ HTTP Mean Latency      │ 42 ms                 │
└────────────────────────┴───────────────────────┘
 Divergent env variables from local env 
┌────────────────┬─────────────────┐
│ SSH_CONNECTION │ 62.74.32.65 508 │
│ XDG_SESSION_ID │ 1761            │
│ SSH_CLIENT     │ 62.74.32.65 508 │
│ SSH_TTY        │ /dev/pts/0      │
└────────────────┴─────────────────┘

 Add your own code metrics: http://bit.ly/code-metrics
 Use `pm2 logs eshop-backend [--lines 1000]` to display logs
 Use `pm2 env 0` to display environment variables
 Use `pm2 monit` to monitor CPU and Memory usage eshop-backend
root@haveanidea:/var/www/eshop/backend# git remote -v
origin  https://github.com/haveanideashop/haveanideashop.git (fetch)
origin  https://github.com/haveanideashop/haveanideashop.git (push)        
root@haveanidea:/var/www/eshop/backend# node -v
npm -v
lsb_release -a
v20.19.6
10.8.2
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 24.04.3 LTS
Release:        24.04
Codename:       noble
root@haveanidea:/var/www/eshop/backend# ufw status verbose
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp (OpenSSH)           ALLOW IN    Anywhere
80,443/tcp (Nginx Full)    ALLOW IN    Anywhere
3001                       DENY IN     Anywhere
22/tcp (OpenSSH (v6))      ALLOW IN    Anywhere (v6)
80,443/tcp (Nginx Full (v6)) ALLOW IN    Anywhere (v6)
3001 (v6)                  DENY IN     Anywhere (v6)

root@haveanidea:/var/www/eshop/backend# 