const fs = require('fs');
const path = require('path');

/**
 * Deletes video files older than 24 hours from the public/videos directory
 * @param {string} videosDir - Path to the videos directory
 * @returns {Promise<{deleted: number, errors: number}>} - Number of files deleted and errors encountered
 */
async function cleanupOldVideos(videosDir = path.join(__dirname, '..', 'public', 'videos')) {
  const deleted = [];
  const errors = [];
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  try {
    // Check if directory exists
    if (!fs.existsSync(videosDir)) {
      console.log(`[Cleanup] Videos directory does not exist: ${videosDir}`);
      return { deleted: 0, errors: 0 };
    }

    // Read all files in the directory
    const files = fs.readdirSync(videosDir);

    for (const file of files) {
      const filePath = path.join(videosDir, file);
      
      try {
        // Get file stats
        const stats = fs.statSync(filePath);
        
        // Skip if it's a directory
        if (stats.isDirectory()) {
          continue;
        }

        // Calculate file age
        const fileAge = now - stats.mtimeMs; // mtimeMs is modification time in milliseconds

        // Delete if file is older than 24 hours
        if (fileAge > twentyFourHours) {
          fs.unlinkSync(filePath);
          deleted.push(file);
          console.log(`[Cleanup] Deleted old video: ${file} (age: ${Math.round(fileAge / (60 * 60 * 1000))} hours)`);
        }
      } catch (error) {
        errors.push({ file, error: error.message });
        console.error(`[Cleanup] Error processing file ${file}:`, error.message);
      }
    }

    if (deleted.length > 0 || errors.length > 0) {
      console.log(`[Cleanup] Completed: ${deleted.length} files deleted, ${errors.length} errors`);
    }

    return { deleted: deleted.length, errors: errors.length };
  } catch (error) {
    console.error('[Cleanup] Fatal error during cleanup:', error);
    return { deleted: 0, errors: 1 };
  }
}

module.exports = { cleanupOldVideos };

