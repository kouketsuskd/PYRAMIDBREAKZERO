# DAYBREAK XIV REBIRTH 15 — BGM SWITCH FIX

修正内容:
- 後半BGM開始時に前半BGMを完全停止
- 前半BGMの音量を0にして pause
- 前半BGMの再生位置も0へ戻す
- 残っているフェード処理をすべて停止
- 必殺技後の音量復帰処理でも前半BGMが復活しないよう修正
- 後半BGMのみ1.8秒でフェードイン

GitHubへ入れるもの:
- index.html
- audio/pixel-heartbeat.mp3
- audio/kudakebashi-no-ketto.mp3
