declare namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string;
      GCP_BUCKET_NAME: string;
    }
  }