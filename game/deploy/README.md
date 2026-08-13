# 4945 VN deployment

Production host: `4945.iyouren.top`

- Releases live under `/srv/4945-vn/releases/<version>`.
- `/srv/4945-vn/current` is the only Nginx document-root symlink.
- Nginx site: `/etc/nginx/conf.d/4945-vn.conf`.
- ACME webroot: `/var/www/letsencrypt`.
- Existing containers and existing Nginx site files are outside this deployment scope.
- The `aliyun-4945` SSH alias and its existing remote account are operational prerequisites; this script does not broaden their privileges.

Release with `npm run deploy`. The script builds from the game root, verifies the manifest and injected Service Worker, uploads to a unique staging directory, promotes it to an immutable release, and atomically switches `current`. Use `npm run deploy -- --skip-build --dry-run` to validate an existing local artifact without remote writes.

Rollback is an atomic symlink change. Use a unique temporary link, verify `readlink`, then run the public smoke gate. Nginx reload is only needed when its configuration changed:

```sh
ln -s /srv/4945-vn/releases/<previous-version> /srv/4945-vn/.rollback-<unique>
mv -T /srv/4945-vn/.rollback-<unique> /srv/4945-vn/current
readlink /srv/4945-vn/current
```

Before a future release, bump the app/service-worker version when cached assets change, build locally, upload a new immutable release directory, validate it, and only then switch `current`.
