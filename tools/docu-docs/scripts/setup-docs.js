const fs = require('fs');
const path = require('path');

// Source and destination paths
const sourceDocsDir = path.join(__dirname, '../docs');
const destDocsDir = path.join(__dirname, '../docs');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDocsDir)) {
  fs.mkdirSync(destDocsDir, { recursive: true });
}

// Function to convert WooCommerce tags to Docusaurus metadata
function convertFrontMatter(content) {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontMatterRegex);
  
  if (!match) return content;

  // Parse the front matter into an object
  const frontMatterLines = match[1].split('\n');
  const frontMatterObj = {};
  
  frontMatterLines.forEach(line => {
    if (line.trim()) {
      const [key, ...valueParts] = line.split(':');
      let value = valueParts.join(':').trim();
      // Remove any double quotes
      value = value.replace(/^""|""$/g, '');
      value = value.replace(/^"|"$/g, '');
      if (key.trim()) {
        frontMatterObj[key.trim()] = value;
      }
    }
  });

  // Convert post_title to title and properly quote it
  if (frontMatterObj.post_title) {
    frontMatterObj.title = frontMatterObj.post_title;
    delete frontMatterObj.post_title;
  }

  // Convert tags to category and array format
  if (frontMatterObj.tags) {
    const tags = frontMatterObj.tags.split(',').map(tag => tag.trim());
    frontMatterObj.category = tags[0];
    frontMatterObj.tags = tags;
  }

  // Remove menu_title
  delete frontMatterObj.menu_title;

  // Convert back to YAML front matter with proper formatting
  const newFrontMatter = Object.entries(frontMatterObj)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        // Format arrays properly
        return `${key}:\n${value.map(v => `  - "${v}"`).join('\n')}`;
      } else if (typeof value === 'string') {
        // Quote string values, escaping any quotes in the content
        const escapedValue = value.replace(/"/g, '\\"');
        return `${key}: "${escapedValue}"`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');

  return `---\n${newFrontMatter}\n---${content.slice(match[0].length)}`;
}

// Function to create index files for each directory
function createIndexFile(dirPath, title) {
  const indexPath = path.join(dirPath, 'index.md');
  const content = `---
title: "${title}"
sidebar_position: 1
---

# ${title}

Welcome to the ${title} section of the WooCommerce Developer Documentation.
`;

  fs.writeFileSync(indexPath, content);
}

// Function to process directories recursively
function processDirectory(sourcePath, destPath) {
  const items = fs.readdirSync(sourcePath);

  items.forEach(item => {
    const sourceItemPath = path.join(sourcePath, item);
    const destItemPath = path.join(destPath, item);
    
    if (fs.statSync(sourceItemPath).isDirectory()) {
      // Create destination directory if it doesn't exist
      if (!fs.existsSync(destItemPath)) {
        fs.mkdirSync(destItemPath, { recursive: true });
      }

      // Create index.md file for the directory
      const title = item
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      createIndexFile(destItemPath, title);

      // Process subdirectory
      processDirectory(sourceItemPath, destItemPath);
    } else if (item.endsWith('.md')) {
      // Process and copy markdown files
      const content = fs.readFileSync(sourceItemPath, 'utf8');
      const processedContent = convertFrontMatter(content);
      fs.writeFileSync(destItemPath, processedContent);
    }
  });
}

// Start processing from the root docs directory
processDirectory(sourceDocsDir, destDocsDir);

console.log('Documentation setup completed!'); 