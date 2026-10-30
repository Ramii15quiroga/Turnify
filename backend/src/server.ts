import { app } from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Turnify backend running on http://localhost:${PORT}`);
});

