// Script to update OpenAI API key in .env.local
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env.local file
const envPath = path.resolve(process.cwd(), '.env.local');

// Read the current .env.local file
fs.readFile(envPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading .env.local file:', err);
    rl.close();
    return;
  }

  rl.question('Enter your OpenAI API key (starts with sk-): ', (apiKey) => {
    if (!apiKey.startsWith('sk-')) {
      console.error('Invalid API key format. OpenAI API keys start with "sk-"');
      rl.close();
      return;
    }

    // Replace the OpenAI API key in the file
    const updatedEnv = data.replace(
      /OPENAI_API_KEY=.*/,
      `OPENAI_API_KEY=${apiKey}`
    );

    // Write the updated content back to .env.local
    fs.writeFile(envPath, updatedEnv, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing to .env.local file:', writeErr);
        rl.close();
        return;
      }

      console.log('OpenAI API key updated successfully!');
      rl.close();
    });
  });
});
