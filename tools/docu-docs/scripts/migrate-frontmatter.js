const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

// Function to convert tags to proper array format
const normalizeTags = (tags) => {
  if (!tags) return undefined;
  
  // If it's already an array, ensure all items are strings and remove empty ones
  if (Array.isArray(tags)) {
    return tags
      .map(tag => String(tag).trim())
      .filter(tag => tag.length > 0);
  }
  
  // If it's a string, split by commas or spaces and clean up
  if (typeof tags === 'string') {
    return tags
      .split(/[,\s]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }
  
  return undefined;
};

// Function to migrate frontmatter in a single file
const migrateFrontmatter = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: markdownContent } = matter(content);
  let needsUpdate = false;

  // Create a new frontmatter object
  const newData = { ...data };

  // Migrate post_title to title
  if (data.post_title) {
    newData.title = data.post_title;
    delete newData.post_title;
    needsUpdate = true;
  }

  // Migrate menu_title to sidebar_label
  if (data.menu_title) {
    newData.sidebar_label = data.menu_title;
    delete newData.menu_title;
    needsUpdate = true;
  }

  // Normalize tags
  if (data.tags) {
    const normalizedTags = normalizeTags(data.tags);
    if (normalizedTags) {
      // Only update if the tags are different
      if (JSON.stringify(normalizedTags) !== JSON.stringify(data.tags)) {
        newData.tags = normalizedTags;
        needsUpdate = true;
      }
    }
  }

  // Only update the file if changes were made
  if (needsUpdate) {
    const updatedContent = matter.stringify(markdownContent, newData);
    fs.writeFileSync(filePath, updatedContent);
    console.log(`✅ Updated frontmatter in ${filePath}`);
    if (data.tags !== newData.tags) {
      console.log(`   Tags changed from ${JSON.stringify(data.tags)} to ${JSON.stringify(newData.tags)}`);
    }
    return true;
  }

  return false;
};

// Process all markdown files
const migrateAllFiles = () => {
  const files = glob.sync('../../docs/**/*.md');
  let totalUpdated = 0;

  files.forEach(file => {
    if (migrateFrontmatter(file)) {
      totalUpdated++;
    }
  });

  console.log(`\nMigration complete! Updated ${totalUpdated} files.`);
};

// Run the migration
migrateAllFiles(); 