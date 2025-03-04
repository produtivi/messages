/**
 * Utilities for working with WhatsApp message templates
 */
import logger from './logger.js';

// In-memory template cache
const templateCache = {};

/**
 * Load a template from the database or other source
 * 
 * @private
 * @param {string} templateName - Name of the template to load
 * @returns {Promise<Object>} - Template object
 */
async function _loadTemplate(templateName) {
  // This is a placeholder - in a real implementation, this would load from DB
  // For now, return a mock template for demonstration purposes
  
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Mock template format similar to WhatsApp Business API
  return {
    name: templateName,
    components: [
      {
        type: 'HEADER',
        text: 'Welcome to {{1}}!'
      },
      {
        type: 'BODY',
        text: 'Hello {{1}}, we\'re glad you\'re here. Your account number is {{2}}.'
      }
    ]
  };
}

/**
 * Get a template from cache or load it
 * 
 * @private
 * @param {string} templateName - Name of the template to get
 * @returns {Promise<Object>} - Template object
 */
async function _getTemplate(templateName) {
  if (templateCache[templateName]) {
    logger.debug(`Using cached template: ${templateName}`);
    return templateCache[templateName];
  }
  
  logger.info(`Loading template: ${templateName}`);
  const template = await _loadTemplate(templateName);
  
  // Cache the template
  templateCache[templateName] = template;
  
  return template;
}

/**
 * Parse a template with parameters
 * 
 * @param {string} templateName - Name of the template
 * @param {Object|Array} templateParams - Parameters for the template
 * @returns {string} - Parsed template content
 */
export async function parseTemplate(templateName, templateParams) {
  try {
    logger.info(`Parsing template: ${templateName}`);
    
    const template = await _getTemplate(templateName);
    let result = '';
    
    // Convert params to array if it's an object
    const paramsArray = Array.isArray(templateParams) 
      ? templateParams 
      : Object.values(templateParams);
    
    // Process each component of the template
    for (const component of template.components) {
      if (component.text) {
        let componentText = component.text;
        
        // Replace parameters in the text
        paramsArray.forEach((param, index) => {
          const paramPlaceholder = new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g');
          componentText = componentText.replace(paramPlaceholder, param);
        });
        
        result += componentText + '\n\n';
      }
    }
    
    logger.info(`Successfully parsed template: ${templateName}`);
    
    return result.trim();
  } catch (error) {
    logger.error(`Error parsing template: ${error.message}`, { error });
    throw new Error(`Failed to parse template ${templateName}: ${error.message}`);
  }
}

/**
 * Clear the template cache
 * Useful for testing or after template updates
 */
export function clearTemplateCache() {
  Object.keys(templateCache).forEach(key => delete templateCache[key]);
  logger.info('Template cache cleared');
}