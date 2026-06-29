/**
 * Data Service Module
 * Transforms CSV data into hierarchical chapter structure
 */

/**
 * Chapter titles mapping
 */
const CHAPTER_TITLES = {
  1: 'Introduction to Anatomy & Physiology',
  2: 'Chemistry',
  3: 'The Cell',
  4: 'Metabolism',
  5: 'Tissues',
  6: 'Integumentary System',
  7: 'Skeletal System: Bones',
  8: 'Skeletal System: Joints',
  9: 'Muscular System',
  10: 'Nervous System (Overview)',
  11: 'CNS & PNS',
  12: 'General and Special Senses'
};

/**
 * Only include learning outcomes from this course (Anatomy and Physiology I).
 * Rows tagged "Anatomy and Physiology II" are excluded entirely.
 */
const COURSE_SEMESTER = 'Anatomy and Physiology I';

/**
 * Transform CSV rows into hierarchical chapter structure
 * @param {Array<Object>} csvRows - Raw CSV data
 * @returns {Object} Chapter-indexed data structure
 */
export function transformToChapterData(csvRows) {
  const chapterMap = {};

  // Filter only learning outcomes (Type === "LO") that belong to A&P I.
  // Anatomy and Physiology II outcomes are excluded.
  const learningOutcomes = csvRows.filter(
    row => row.Type === 'LO' && row.Semester === COURSE_SEMESTER
  );

  // Also get folders and subjects for hierarchy
  const folders = csvRows.filter(row => row.Type === 'Folder');
  const subjects = csvRows.filter(row => row.Type === 'Subject');

  // Create lookup maps
  const folderMap = createLookupMap(folders);
  const subjectMap = createLookupMap(subjects);

  // Group learning outcomes by chapter
  learningOutcomes.forEach(lo => {
    const chapter = parseInt(lo.Chapter, 10);

    // Skip invalid chapters
    if (!chapter || chapter < 1 || chapter > 12) {
      return;
    }

    // Initialize chapter if not exists
    if (!chapterMap[chapter]) {
      chapterMap[chapter] = {
        number: chapter,
        title: CHAPTER_TITLES[chapter] || `Chapter ${chapter}`,
        modules: [],
        moduleMap: {} // For quick lookup
      };
    }

    // Get parent subject
    const subject = subjectMap[lo.ParentID];
    if (!subject) {
      console.warn(`Subject not found for LO: ${lo.ID}`);
      return;
    }

    // Get parent module (folder). Some subjects have a broken parent
    // reference in the source data; group those under a chapter-level
    // fallback module so the subject still renders.
    const module = folderMap[subject.ParentID];
    const moduleId = module ? module.ID : `__nomodule__-${chapter}`;
    const moduleTitle = module ? module.Title : '';
    const moduleDescription = module ? module.Description : '';

    // Get or create module in chapter
    let chapterModule = chapterMap[chapter].moduleMap[moduleId];
    if (!chapterModule) {
      chapterModule = {
        id: moduleId,
        title: moduleTitle,
        description: moduleDescription,
        subjects: [],
        subjectMap: {} // For quick lookup
      };
      chapterMap[chapter].moduleMap[moduleId] = chapterModule;
      chapterMap[chapter].modules.push(chapterModule);
    }

    // Get or create subject in module
    let chapterSubject = chapterModule.subjectMap[subject.ID];
    if (!chapterSubject) {
      chapterSubject = {
        id: subject.ID,
        title: subject.Title,
        description: subject.Description,
        outcomes: []
      };
      chapterModule.subjectMap[subject.ID] = chapterSubject;
      chapterModule.subjects.push(chapterSubject);
    }

    // Add learning outcome to subject
    chapterSubject.outcomes.push({
      id: lo.ID,
      title: lo.Title,
      description: lo.Description
    });
  });

  // Clean up lookup maps (not needed in final output)
  Object.values(chapterMap).forEach(chapter => {
    delete chapter.moduleMap;
    chapter.modules.forEach(module => {
      delete module.subjectMap;
    });
  });

  return chapterMap;
}

/**
 * Create lookup map from array of objects by ID
 * @param {Array<Object>} items - Array of items with ID property
 * @returns {Object} Lookup map with ID as key
 */
function createLookupMap(items) {
  const map = {};
  items.forEach(item => {
    map[item.ID] = item;
  });
  return map;
}

/**
 * Get chapter data by number
 * @param {Object} chapterMap - Chapter-indexed data
 * @param {number} chapterNumber - Chapter number (1-12)
 * @returns {Object|null} Chapter data or null if not found
 */
export function getChapterData(chapterMap, chapterNumber) {
  return chapterMap[chapterNumber] || null;
}

/**
 * Get all chapters as array
 * @param {Object} chapterMap - Chapter-indexed data
 * @returns {Array<Object>} Array of chapter data sorted by number
 */
export function getAllChapters(chapterMap) {
  return Object.values(chapterMap).sort((a, b) => a.number - b.number);
}

/**
 * Get statistics for a chapter
 * @param {Object} chapterData - Chapter data
 * @returns {Object} Statistics { moduleCount, subjectCount, outcomeCount }
 */
export function getChapterStats(chapterData) {
  if (!chapterData) {
    return { moduleCount: 0, subjectCount: 0, outcomeCount: 0 };
  }

  let subjectCount = 0;
  let outcomeCount = 0;

  chapterData.modules.forEach(module => {
    subjectCount += module.subjects.length;
    module.subjects.forEach(subject => {
      outcomeCount += subject.outcomes.length;
    });
  });

  return {
    moduleCount: chapterData.modules.length,
    subjectCount,
    outcomeCount
  };
}

/**
 * Get global statistics
 * @param {Object} chapterMap - Chapter-indexed data
 * @returns {Object} Global statistics
 */
export function getGlobalStats(chapterMap) {
  const chapters = getAllChapters(chapterMap);

  let totalModules = 0;
  let totalSubjects = 0;
  let totalOutcomes = 0;

  chapters.forEach(chapter => {
    const stats = getChapterStats(chapter);
    totalModules += stats.moduleCount;
    totalSubjects += stats.subjectCount;
    totalOutcomes += stats.outcomeCount;
  });

  return {
    chapterCount: chapters.length,
    moduleCount: totalModules,
    subjectCount: totalSubjects,
    outcomeCount: totalOutcomes
  };
}

/**
 * Search learning outcomes by keyword
 * @param {Object} chapterMap - Chapter-indexed data
 * @param {string} keyword - Search keyword
 * @returns {Array<Object>} Array of matching outcomes with chapter/module/subject context
 */
export function searchOutcomes(chapterMap, keyword) {
  const results = [];
  const lowerKeyword = keyword.toLowerCase();

  Object.values(chapterMap).forEach(chapter => {
    chapter.modules.forEach(module => {
      module.subjects.forEach(subject => {
        subject.outcomes.forEach(outcome => {
          if (
            outcome.description.toLowerCase().includes(lowerKeyword) ||
            outcome.title.toLowerCase().includes(lowerKeyword)
          ) {
            results.push({
              outcome,
              subject: subject.title,
              module: module.title,
              chapter: chapter.number,
              chapterTitle: chapter.title
            });
          }
        });
      });
    });
  });

  return results;
}
