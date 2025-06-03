# Feature Content Generator
This project is a Next.js application using TypeScript and Tailwind CSS. It leverages various Radix UI components and other modern libraries.

## Getting Started
### 1. Install Dependencies

This project uses `pnpm` as the preferred package manager (see `pnpm-lock.yaml`). If you don't have pnpm installed, you can install it globally:
```sh
npm install -g pnpm
```

Then, install the dependencies:
```sh
pnpm install
```

> **Note:** If you use `npm install` and encounter dependency conflicts (e.g., with `date-fns` and `react-day-picker`), update your `date-fns` version in `package.json` to `^3.0.0` or use pnpm for smoother dependency resolution.

### 2. Run the Development Server
```sh
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 3. Build for Production
```sh
pnpm build
```

### 4. Start the Production Server
```sh
pnpm start
```

---

# 🔄 Migrating to GCP (Vertex AI + Bucket Storage)
This guide helps you migrate your local/OpenAI-based setup to a Google Cloud Platform (GCP)-backed system using Vertex AI and GCS (Google Cloud Storage). It includes how to set up your credentials, create the storage bucket, and upload your prompt templates.

---

## ✅ Prerequisites
Before you begin:
- You have a Google Cloud project set up.
- Billing is enabled for the project.
- Vertex AI and Storage APIs are enabled.
- You’ve installed the [gcloud CLI](https://cloud.google.com/sdk/docs/install).

---

## 📁 1. Create and Configure a GCP Bucket
```bash
# Replace with your desired bucket name and region
GCP_BUCKET_NAME=content-kings2025
GCP_REGION=us-central1

# Create the bucket
gsutil mb -l $GCP_REGION gs://$GCP_BUCKET_NAME/

# Enable uniform bucket-level access
gsutil uniformbucketlevelaccess set on gs://$GCP_BUCKET_NAME
```

### Set Bucket Permissions
Ensure your service account has the following roles:
- `Storage Admin`
- `Vertex AI User`

To set permissions:
```bash
# Replace with your service account email
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:your-service-account@your-project.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

---

## 🔑 2. Set Environment Variables
Add the following to your `.env` file:

```env
GCP_BUCKET_NAME=content-kings2025
GOOGLE_APPLICATION_CREDENTIALS=./path/to/your-service-account.json
AI_API_KEYS=openai=sk-xxx,vertex=your-project-id:us-central1:gemini-2.0-pro
```

You can export them for CLI use as well:

```bash
export GCP_BUCKET_NAME=content-kings2025
export GOOGLE_APPLICATION_CREDENTIALS=./secrets/gcp-sa.json
export AI_API_KEYS=openai=sk-xxx,vertex=your-project-id:us-central1:gemini-2.0-pro
```

---

## ⬆️ 3. Upload Default Prompt Templates
Use the CLI to upload the default prompt templates to your GCS bucket:

```bash
# Ensure prompts are located in /prompts/default
gsutil -m cp prompts/default/*.json gs://$GCP_BUCKET_NAME/default/
```

---

## 🧠 4. Switching to Vertex AI Models
Update your generation logic to use Vertex AI SDK instead of OpenAI. Example:

```ts
import { ChatModel } from '@google-cloud/vertexai';

const model = new ChatModel({ project: 'your-project-id', location: 'us-central1' });
const chat = model.startChat();
const result = await chat.sendMessage('Hello, world');
console.log(result.text);
```

---

## ✅ Migration Complete!
You now have prompt templates hosted on GCP, proper credentials wired, and the ability to swap between OpenAI and Vertex AI models using environment flags.

Feel free to customize the `.env` and prompt sync strategy further based on your workflow or CI/CD setup.

## Troubleshooting
- If you see dependency errors with npm, try using pnpm or update conflicting dependencies as described above.
- For more scripts, see the `scripts` section in `package.json`.

## Stack
- Next.js
- TypeScript
- Tailwind CSS
- Radix UI

## License
This project is private.