import * as dotenv from 'dotenv';
import { defineConfig } from 'orval';

dotenv.config();

export default defineConfig({
  client: {
    input: {
      target: `${process.env.NEXT_PUBLIC_API_URL}/openapi.json`,
    },
    output: {
      target: './src/types/generated',
      mode: 'split', // Each type/interface in its own file
      clean: true, // Clean output directory before generating
      schemas: './src/types/generated', // Only generate schemas/types
    },
  },
});
