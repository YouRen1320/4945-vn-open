# ROLLBACK v3.0.0 → v2.9.0

## 回滚步骤

```sh
# 切回 v2.9.0 构建
ssh aliyun-4945 'ln -s /srv/4945-vn/releases/2.9.0 /srv/4945-vn/.rollback-2.9.0 && mv -T /srv/4945-vn/.rollback-2.9.0 /srv/4945-vn/current && readlink /srv/4945-vn/current'

# 验证旧版本可访问
curl -sI https://4945.iyouren.top/ | head -1
# 预期：HTTP/2 200
```

## 数据兼容性

| 数据层 | v3.0.0 → v2.9.0 回滚影响 |
|--------|--------------------------|
| schema5 存档 | ✅ 兼容（v2.9.0 也使用 schema5） |
| Season2OutcomeRecord | ⚠️ v3.0.0 创建的记录在 v2.9.0 中不可见但数据保留 |
| 收藏 v2 | ✅ 兼容 |
| v4 旧存档 | ✅ 不受影响 |
| Butterfly/Worldline flags | ✅ 兼容（v2.9.0 已含蝴蝶系统） |
| EndingRegistry | ✅ 兼容（v2.9.0 已含结局注册表） |

## 回滚验证清单

- [ ] 旧构建可访问（HTTP 200）
- [ ] 已有 schema5 存档可正常读取
- [ ] 第二季进度可正常游玩
- [ ] 收藏 v2 内容正确显示
- [ ] 第一季存档 > 迁移选择 > 第二季开局流程正常
- [ ] 无 JS 控制台错误

## 恢复 v3.0.0

```sh
ssh aliyun-4945 'ln -s /srv/4945-vn/releases/3.0.0 /srv/4945-vn/.rollback-3.0.0 && mv -T /srv/4945-vn/.rollback-3.0.0 /srv/4945-vn/current && readlink /srv/4945-vn/current'
```

## 回滚失败应急预案

若 nginx 配置或符号链接操作失败：
1. 检查 `/srv/4945-vn/releases/2.9.0/index.html`、`sw.js` 和 `.vite/manifest.json` 是否存在且完整
2. 手动 `ls -la /srv/4945-vn/current` 确认目标
3. 如需要，重启 nginx：`systemctl restart nginx`
4. 检查 nginx 错误日志：`tail -50 /var/log/nginx/error.log`
