const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

// Define path to docs relative to this script
const DOCS_PATH = path.join(__dirname, '../../../docs');

// Files to exclude from the sidebar and processing
const excludeFiles = [
  'cart-and-checkout-blocks/checkout-payment-methods/payment-method-integration',
  'contributing-docs/contributing-docs',
  // Add any other files to exclude here
];

// Helper function to capitalize and format header text
const formatHeaderText = (tag) => {
  return tag.toUpperCase().replace(/-/g, ' ');
};

// Read and parse a markdown file
const parseMarkdownFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(content);
  return {
    id: path.relative(DOCS_PATH, filePath).replace(/\.md$/, ''),
    ...data,
    tags: Array.isArray(data.tags) ? data.tags : []
  };
};

// Group files by their directory structure
const groupFilesByStructure = (files) => {
  const structure = {};

  files.forEach(file => {
    const parts = file.id.split('/');
    let current = structure;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        // It's a file
        if (!current.files) current.files = [];
        current.files.push(file);
      } else {
        // It's a directory
        if (!current.directories) current.directories = {};
        if (!current.directories[part]) {
          current.directories[part] = {};
        }
        current = current.directories[part];
      }
    });
  });

  return structure;
};

// Sort directories in the desired order
const sortDirectories = (directories) => {
  const order = [
    'GETTING_STARTED',
    'EXTENSION_DEVELOPMENT',
    'BUILDING_WOO_STORE',
    'WC_CLI',
    'CODE_SNIPPETS',
    'THEMING',
    'FEATURES',
    'REST_API',
    'REPORTING',
    'BLOCK_DEVELOPMENT',
    'BEST_PRACTICES'
  ];

  // Helper to normalize category type
  const normalizeType = (type) => {
    if (!type) return '';
    // Convert to uppercase and replace spaces/hyphens with underscores
    return type.toUpperCase().replace(/[-\s]/g, '_');
  };

  // Process directories only once
  const processedDirs = new Map();
  
  Object.entries(directories).forEach(([dirName, struct]) => {
    if (!processedDirs.has(dirName)) {
      const readme = struct.files?.find(f => f.id.endsWith('README'));
      const type = normalizeType(readme?.category_type || '');
      processedDirs.set(dirName, {
        dirName,
        struct,
        readme,
        type,
        orderIndex: order.indexOf(type)
      });
    }
  });

  return Array.from(processedDirs.values())
    .sort((a, b) => {
      // If both have valid positions in order array, sort by that
      if (a.orderIndex !== -1 && b.orderIndex !== -1) {
        return a.orderIndex - b.orderIndex;
      }
      
      // If only one has a valid position, put it first
      if (a.orderIndex !== -1) return -1;
      if (b.orderIndex !== -1) return 1;
      
      // If neither has a position in order array, sort alphabetically by category_title or directory name
      const titleA = a.readme?.category_title || a.dirName;
      const titleB = b.readme?.category_title || b.dirName;
      return titleA.localeCompare(titleB);
    })
    .map(({ dirName, struct }) => [dirName, struct]);
};

// Generate sidebar items for a directory
const generateSidebarItems = (structure, parentPath = '') => {
  const items = [];
  const allFiles = [];

  // First, collect all files recursively
  const collectFiles = (struct, path = '') => {
    if (struct.files) {
      struct.files.forEach(file => {
        // Skip files that are in the exclude list
        if (!excludeFiles.includes(file.id)) {
          allFiles.push(file);
        }
      });
    }
    if (struct.directories) {
      Object.entries(struct.directories).forEach(([dirName, dirStruct]) => {
        collectFiles(dirStruct, path + '/' + dirName);
      });
    }
  };
  collectFiles(structure);

  // Get all unique tags
  const tags = new Set(allFiles.flatMap(f => f.tags || []));

  // Add items grouped by tags
  Array.from(tags).forEach(tag => {
    const filesWithTag = allFiles.filter(f => f.tags?.includes(tag));
    if (filesWithTag.length > 0) {
      items.push(createTagHeader(tag));
      filesWithTag
        .sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id))
        .forEach(file => {
          if (!file.id.endsWith('README')) {
            items.push(file.id);
          }
        });
    }
  });

  // Add remaining files that don't have tags
  const untaggedFiles = allFiles.filter(f => !f.tags || f.tags.length === 0);
  untaggedFiles
    .sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id))
    .forEach(file => {
      if (!file.id.endsWith('README')) {
        items.push(file.id);
      }
    });

  return items;
};

// Format directory label
const formatDirectoryLabel = (dirName, readme) => {
  // First try to use category_title from README
  if (readme?.category_title) {
    return readme.category_title;
  }
  // Then try to use title
  if (readme?.title) {
    return readme.title;
  }
  // Then try to format category_type
  if (readme?.category_type) {
    return formatCategoryType(readme.category_type);
  }
  // Finally fall back to formatting directory name
  return dirName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Format category type for display
const formatCategoryType = (type) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Create a tag header item
const createTagHeader = (tag) => ({
  type: 'html',
  value: formatHeaderText(tag),
  className: 'menu__list-item-collapsible menu__list-item--header'
});

// Add these functions after the existing imports
const updateReadmeContent = (readmePath, files) => {
  const content = fs.readFileSync(readmePath, 'utf8');
  const { data, content: markdownContent } = matter(content);
  
  // Get the first paragraph (description) - everything up to the first ## or end
  const descriptionMatch = markdownContent.match(/^([^#]*?)(?:##|$)/s);
  const description = descriptionMatch ? descriptionMatch[1].trim() : '';
  
  // Group files by their tags
  const groupedFiles = new Map();
  files.forEach(file => {
    if (file.id.endsWith('README')) return; // Skip README files
    
    // Use REFERENCE as default if no tags
    const tags = file.tags?.length ? file.tags : ['REFERENCE'];
    
    tags.forEach(tag => {
      if (!groupedFiles.has(tag)) {
        groupedFiles.set(tag, []);
      }
      groupedFiles.get(tag).push(file);
    });
  });

  // Generate the new content with proper frontmatter
  let newContent = '---\n';
  Object.entries(data).forEach(([key, value]) => {
    newContent += `${key}: ${value}\n`;
  });
  newContent += '---\n\n' + description + '\n';
  
  // Add links grouped by tags
  groupedFiles.forEach((files, tag) => {
    newContent += `\n## ${formatHeaderText(tag)}\n\n`;
    files.sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id))
      .forEach(file => {
        const title = file.title || file.sidebar_label || file.id.split('/').pop();
        const link = file.id;
        
        // Determine icon based on tag
        let icon = '📄';
        if (tag.toLowerCase() === 'how to') {
          icon = '❓';
        } else if (tag.toLowerCase() === 'reference') {
          icon = '📚';
        } else if (tag.toLowerCase() === 'tutorial') {
          icon = '📝';
        }
        
        // Add link with card-like styling using MDX
        newContent += `<div className="card-wrapper">
  <a href="${link}" data-icon="${icon}">${title}</a>
</div>\n\n`;
      });
  });

  // Write the updated content
  fs.writeFileSync(readmePath, newContent);
};

// Generate the complete sidebar configuration
const generateSidebar = () => {
  // Get all markdown files, excluding the problematic ones
  const files = glob.sync(path.join(DOCS_PATH, '**/*.md'))
    .filter(file => {
      const relativePath = path.relative(DOCS_PATH, file).replace(/\.md$/, '');
      return !excludeFiles.includes(relativePath);
    })
    .map(parseMarkdownFile);
  
  // Group files by directory structure
  const structure = groupFilesByStructure(files);
  
  // Find the first README to use as introduction
  const firstReadme = files.find(file => file.id.endsWith('README'));
  
  // Start with the introduction using the first README found
  const sidebar = [
    {
      type: 'doc',
      id: firstReadme?.id || 'block-theme-development/README',
      label: 'Introduction'
    }
  ];

  // Sort and process top-level directories
  const sortedDirs = sortDirectories(structure.directories || {});
  
  // Group directories by category type
  const groupedDirs = new Map();
  sortedDirs.forEach(([dirName, dirStructure]) => {
    const readme = dirStructure.files?.find(f => f.id.endsWith('README'));
    const type = readme?.category_type || '';
    
    if (!groupedDirs.has(type)) {
      groupedDirs.set(type, []);
    }
    groupedDirs.get(type).push([dirName, dirStructure, readme]);
  });

  // Add directories in order, with headers for each category type
  groupedDirs.forEach((dirs, type) => {
    if (type) {
      // Add category header
      sidebar.push({
        type: 'html',
        value: formatHeaderText(type),
        className: 'menu__list-item-collapsible menu__list-item--header'
      });
    }

    // Add directories in this category
    dirs.forEach(([dirName, dirStructure, readme]) => {
      const items = generateSidebarItems(dirStructure, dirName);
      
      // Create category with link to README
      sidebar.push({
        type: 'category',
        label: formatDirectoryLabel(dirName, readme),
        link: {
          type: 'doc',
          id: `${dirName}/README`
        },
        items: items
      });
    });
  });

  // Update README files
  sortedDirs.forEach(([dirName, dirStructure]) => {
    const readmePath = path.join(DOCS_PATH, dirName, 'README.md');
    if (fs.existsSync(readmePath)) {
      const categoryFiles = [];
      const collectFiles = (struct) => {
        if (struct.files) {
          categoryFiles.push(...struct.files);
        }
        if (struct.directories) {
          Object.values(struct.directories).forEach(collectFiles);
        }
      };
      collectFiles(dirStructure);
      updateReadmeContent(readmePath, categoryFiles);
    }
  });

  return {
    docs: sidebar
  };
};

// Write the generated sidebar configuration
const sidebarConfig = generateSidebar();
const sidebarPath = path.join(__dirname, '../sidebars.js');
fs.writeFileSync(
  sidebarPath,
  `module.exports = ${JSON.stringify(sidebarConfig, null, 2)};`
);


console.log('Sidebar configuration generated successfully!'); 