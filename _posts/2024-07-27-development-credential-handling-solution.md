---
layout: post
title: "Protecting Secrets: Credential Handling for Open-Source Projects"
date: 2024-07-27 22:30:00 +0800
categories: credentials, programming
---

## Introduction

This blog aims to document an effective method I recently developed for managing credential API keys in the open-source project [Trackmaker](https://github.com/Anson2251/trackmaker) which I have been developing for a long time, and the journey I came up with this method. The method uses a private credential configuration file to store the credentials or passes the credentials via environment variables. The first approach simplifies debugging, while the second approach enables GitHub Actions to automatically build GitHub Pages without the need to upload a private credential configuration file.

## How I Came Up with This Idea and Made a Framework

The consideration for protecting credentials dates back to when I signed up for the [Bing Maps Dev Centre](https://www.bingmapsportal.com/) and obtained a basic key. According to the terms of use, this credential key must not be exposed to the public. This posed a challenging task: ensuring the program can read the key without including any key-related information in the publicly accessible code on GitHub.

To address this problem, I explored various solutions over several months. To evaluate the quality of these solutions, I considered the following factors:

- [ ] **Can avoid the credentials from being exposed via the source code.**
  - The source code can be accessed by the public.
- [ ] **Can avoid the credentials from being exposed via the built product.**
  - The credentials may be obtained from reverse engineering.
- [ ] **Can support the source code to be built without uploading the credentials.**
  - The project should pass compilation even if the credentials are not included, making it fully open to the public.
- [ ] **Can cooperate with GitHub Pages & Actions to build the page automatically.**
- [ ] **New credentials can be added easily.**

### .gitignore

The preliminary method I came up with was straightforward: separate the storage of the credential keys and add the file containing the keys to `.gitignore`.

- [x] Can avoid the credentials from being exposed via the source code.
- [ ] Can avoid the credentials from being exposed via the built product.
- [ ] Can support the source code to be built without uploading the credentials.
- [ ] Can cooperate with GitHub Pages & Actions to build the page automatically.
- [ ] New credentials can be added easily.

### Encryption of Credentials

To prevent credentials from being obtained through reverse engineering, I applied a private encryption method. I designed an algorithm to achieve this.

- [x] Can avoid the credentials from being exposed via the source code.
- [x] Can avoid the credentials from being exposed via the built product.
- [ ] Can support the source code to be built without uploading the credentials.
- [ ] Can cooperate with GitHub Pages & Actions to build the page automatically.
- [ ] New credentials can be added easily.

### Configuration File, Environment Variables, & Vite

As I started configuring GitHub Pages to preview the built page, the need to build with the public source code emerged. Credentials can be passed using `secrets`, where the credentials can be stored and accessed when building the page. I also found a useful configuration in Vite, a bundler I used, called [`define`](https://vitejs.dev/config/shared-options.html#define), which defines global constant replacements. With this option, I can replace constants with credentials during the build. To facilitate debugging, I modified the `vite.config.ts` to read credentials from a file and environment variables for GitHub Pages.

Additionally, using `JavaScript Obfuscator` can encrypt the credentials, ensuring they do not exist in plaintext form in the production build.

- [x] Can avoid the credentials from being exposed via the source code.
- [x] Can avoid the credentials from being exposed via the built product.
- [x] Can support the source code to be built without uploading the credentials.
- [x] Can cooperate with GitHub Pages & Actions to build the page automatically.
- [ ] New credentials can be added easily.

### Generalised Framework

To simplify adding new credentials, I packaged the key replacement into a more generalised framework.

- [x] Can avoid the credentials from being exposed via the source code.
- [x] Can avoid the credentials from being exposed via the built product.
- [x] Can support the source code to be built without uploading the credentials.
- [x] Can cooperate with GitHub Pages & Actions to build the page automatically.
- [x] New credentials can be added easily.

## Final Code for the framework

```typescript
import { promises as fs } from "fs"; // handling file operations in node
import { defineConfig } from "vite";

// Default path for the credential configuration file
const credentialFileDefaultPath = "./credentials-config.json";

// Type definition for credential items
type CredentialItemType = {
  name: string;
  type: "string" | "number";
};

// List of credential items to be managed
const credentialItems: CredentialItemType[] = [
  {
    name: "EXAMPLE_KEY",
    type: "string",
  },
];

/**
 * Check if a file exists at the given file path.
 * @param filePath - Path to the file.
 * @returns Promise<boolean> - True if the file exists, false otherwise.
 */
async function checkFileExist(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return Promise.resolve(true);
  } catch (error) {
    return Promise.resolve(false);
  }
}

/**
 * Read the content of a file.
 * @param filePath - Path to the file.
 * @returns Promise<string> - Content of the file.
 */
async function readFile(filePath: string): Promise<string> {
  try {
    const config = await fs.readFile(filePath, {
      encoding: "utf-8",
    });
    return Promise.resolve(config);
  } catch (err) {
    return Promise.reject(`Cannot read from the file "${filePath}"`);
  }
}

/**
 * Load credentials from a specified file path or environment variables.
 * @param credentialFilePath - Path to the credential configuration file.
 * @returns Promise<Record<string, string>> - An object containing the final credentials.
 */
async function getCredentials(credentialFilePath: string) {
  // Log the use of a custom credential configuration file
  if (credentialFilePath !== credentialFileDefaultPath) {
    console.log(`Using credential configuration file: ${credentialFilePath}`);
  }

  // Check if the credential file exists
  const credentialFileExist = await checkFileExist(credentialFilePath);
  // Load credential file content if it exists, otherwise use an empty object
  const credentialFileContent: Record<string, string | number> =
    credentialFileExist ? JSON.parse(await readFile(credentialFilePath)) : {};
  // Object to hold the final credentials
  const finalCredential: Record<string, string> = {};

  // Iterate over each credential item
  credentialItems.forEach((item) => {
    // Try to get the value from environment variables or credential file content
    let value: string | number | undefined =
      process.env[item.name] || credentialFileContent[item.name] || undefined;

    // If value is undefined, issue a warning and set it to an empty string
    if (typeof value === "undefined") {
      console.warn(
        "\x1b[33m%s\x1b[0m",
        `Credential item "${item.name}" cannot be found in the environment or the "${credentialFilePath}"`
      );
      value = "";
    }

    // Convert the value to the appropriate type
    if (item.type === "string") value = String(value);
    else if (item.type === "number") value = Number(value);

    // Add the formatted credential to the finalCredential object
    finalCredential[`__${item.name}__`] = JSON.stringify(value);
  });

  return finalCredential;
}

// Export the Vite configuration
export default defineConfig(async () => {
  // Get the path for the credential configuration file, defaulting to the specified default path
  const credentialsConfigPath =
    process.env.CREDENTIALS_CONFIG_PATH || credentialFileDefaultPath;

  return {
    // Define global constants with the loaded credentials
    define: await getCredentials(credentialsConfigPath),
  };
});
```

## Conclusion

This framework simplifies secure credential management for open-source projects by using private configuration files and environment variables. It ensures credentials are protected while supporting automated builds with GitHub Actions. This approach helps maintain security without complicating the development process.
