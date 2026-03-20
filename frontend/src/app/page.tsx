"use client"; // Client Component

import { Container, Typography, Button, Box, AppBar, Toolbar } from "@mui/material";
import '../styles/globals.css'

export default function HomePage() {
  return (
    <>
      {/* ナビゲーションバー */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CommeVideo
          </Typography>
          <Button color="inherit">ログイン</Button>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h3" gutterBottom>
          ようこそ、CommeVideoへ
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          ここでは動画再生と弾幕コメントを楽しめます。サンプルボタンをクリックしてみてください。
        </Typography>

        <Box mt={4}>
          <Button variant="contained" color="primary" size="large" sx={{ mr: 2 }}>
            動画を見る
          </Button>
          <Button variant="outlined" color="secondary" size="large">
            サンプル弾幕
          </Button>
        </Box>
      </Container>

      {/* フッター */}
      <Box component="footer" sx={{ mt: 8, py: 4, textAlign: "center", bgcolor: "background.paper" }}>
        <Typography variant="body2" color="text.secondary">
          &copy; 2026 CommeVideo. All rights reserved.
        </Typography>
      </Box>
    </>
  );
}