import * as dotenv from 'dotenv';
import { defineConfig } from 'orval';

dotenv.config();

export default defineConfig({
  client: {
    input: {
      target: `${process.env.NEXT_PUBLIC_API_URL}/openapi.json`,
    },
    output: {
      target: './src/types/api.ts',
      mode: 'split',
    },
  },
});
