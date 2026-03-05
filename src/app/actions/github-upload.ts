'use server';

/**
 * @fileOverview Server Action for uploading files to GitHub repository.
 * Optimized for large files (videos) with increased body size limits.
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';

export async function uploadToGithub(formData: FormData) {
  try {
    if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is missing in .env');
    if (!GITHUB_REPO) throw new Error('GITHUB_REPO (username/repo) is missing in .env');

    const file = formData.get('file') as File;
    if (!file || file.size === 0) throw new Error('No valid file provided');

    // Persiapan Data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString('base64');
    
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
    const fileName = `${timestamp}-${safeFileName}`;
    const path = `uploads/${fileName}`;

    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'MoreInk-Admin-App-v3'
      },
      body: JSON.stringify({
        message: `Upload ${fileName} via More Ink Admin`,
        content: base64Content,
        branch: BRANCH,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `GitHub Error (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || response.statusText;
      }
      throw new Error(errorMessage);
    }

    return `https://raw.githubusercontent.com/${GITHUB_REPO}/${BRANCH}/${path}`;
    
  } catch (error: any) {
    console.error('Upload failed:', error.message);
    throw new Error(error.message || 'Transmission failed in the void');
  }
}
