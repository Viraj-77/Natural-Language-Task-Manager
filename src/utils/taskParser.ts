import { ParsedTask } from '../types/Task';

export function parseNaturalLanguageTask(input: string): ParsedTask {
  const cleanInput = input.trim();
  
  // Extract priority (P1, P2, P3, P4)
  const priorityMatch = cleanInput.match(/\b(P[1-4])\b/i);
  const priority = priorityMatch ? (priorityMatch[1].toUpperCase() as 'P1' | 'P2' | 'P3' | 'P4') : 'P3';
  
  // Remove priority from input for further parsing
  const inputWithoutPriority = cleanInput.replace(/\b(P[1-4])\b/i, '').trim();
  
  // Extract assignee patterns
  const assigneePatterns = [
    /\b(?:by|to|for|assign(?:ed)?\s+to|give\s+to)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*?)(?:\s+(?:by|on|at|before|due|until|tomorrow|today|next|this|\d))/i,
    /\b(?:by|to|for|assign(?:ed)?\s+to|give\s+to)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)$/i
  ];
  
  let assignee = '';
  let inputWithoutAssignee = inputWithoutPriority;
  
  for (const pattern of assigneePatterns) {
    const match = inputWithoutPriority.match(pattern);
    if (match) {
      assignee = match[1].trim();
      inputWithoutAssignee = inputWithoutPriority.replace(match[0], '').trim();
      break;
    }
  }
  
  // Extract due date and time
  const dueDate = extractDueDate(inputWithoutAssignee);
  
  // Remove date/time patterns to get clean task name
  const taskName = extractTaskName(inputWithoutAssignee);
  
  return {
    taskName: taskName || cleanInput,
    assignee,
    dueDate,
    priority
  };
}

function extractDueDate(input: string): Date | null {
  const now = new Date();
  
  // Time patterns (12hr and 24hr)
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)/i,
    /(\d{1,2})\s*(am|pm)/i,
    /(\d{1,2}):(\d{2})/
  ];
  
  // Date patterns
  const datePatterns = [
    // Tomorrow
    /\btomorrow\b/i,
    // Today
    /\btoday\b/i,
    // Next week/month
    /\bnext\s+(week|month)\b/i,
    // This week/month
    /\bthis\s+(week|month)\b/i,
    // Specific dates
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i,
    // MM/DD or DD/MM format
    /\b(\d{1,2})\/(\d{1,2})\b/,
    // In X days
    /\bin\s+(\d+)\s+days?\b/i,
    // Next Monday, Tuesday, etc.
    /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i
  ];
  
  let extractedTime: { hours: number; minutes: number } | null = null;
  let extractedDate: Date | null = null;
  
  // Extract time
  for (const pattern of timePatterns) {
    const match = input.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const ampm = match[3]?.toLowerCase();
      
      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      extractedTime = { hours, minutes };
      break;
    }
  }
  
  // Extract date
  for (const pattern of datePatterns) {
    const match = input.match(pattern);
    if (match) {
      if (pattern.source.includes('tomorrow')) {
        extractedDate = new Date(now);
        extractedDate.setDate(extractedDate.getDate() + 1);
      } else if (pattern.source.includes('today')) {
        extractedDate = new Date(now);
      } else if (pattern.source.includes('next week')) {
        extractedDate = new Date(now);
        extractedDate.setDate(extractedDate.getDate() + 7);
      } else if (pattern.source.includes('next month')) {
        extractedDate = new Date(now);
        extractedDate.setMonth(extractedDate.getMonth() + 1);
      } else if (pattern.source.includes('this week')) {
        extractedDate = new Date(now);
        extractedDate.setDate(extractedDate.getDate() + 3);
      } else if (pattern.source.includes('this month')) {
        extractedDate = new Date(now);
        extractedDate.setDate(extractedDate.getDate() + 7);
      } else if (match[1] && match[2]) {
        // Handle month-day patterns
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                           'july', 'august', 'september', 'october', 'november', 'december',
                           'jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                           'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        
        let day: number, month: number;
        
        if (isNaN(parseInt(match[1]))) {
          // Month name first
          month = monthNames.findIndex(m => m.toLowerCase() === match[1].toLowerCase()) % 12;
          day = parseInt(match[2]);
        } else {
          // Day first
          day = parseInt(match[1]);
          month = monthNames.findIndex(m => m.toLowerCase() === match[2].toLowerCase()) % 12;
        }
        
        extractedDate = new Date(now.getFullYear(), month, day);
        if (extractedDate < now) {
          extractedDate.setFullYear(now.getFullYear() + 1);
        }
      } else if (pattern.source.includes('in\\s+')) {
        // "in X days"
        const days = parseInt(match[1]);
        extractedDate = new Date(now);
        extractedDate.setDate(extractedDate.getDate() + days);
      } else if (pattern.source.includes('next\\s+')) {
        // Next weekday
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
                         'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const targetDayIndex = dayNames.findIndex(d => d.toLowerCase() === match[1].toLowerCase());
        const targetDay = targetDayIndex % 7;
        const currentDay = now.getDay();
        
        // Calculate days until next occurrence of the target day
        let daysUntilTarget = targetDay - currentDay;
        if (daysUntilTarget <= 0) {
          daysUntilTarget += 7; // Next week
        }
        
        extractedDate = new Date(now);
        extractedDate.setDate(extractedDate.getDate() + daysUntilTarget);
      }
      break;
    }
  }
  
  // Combine date and time
  if (extractedDate) {
    if (extractedTime) {
      extractedDate.setHours(extractedTime.hours, extractedTime.minutes, 0, 0);
    }
    // Validate the date before returning
    if (isNaN(extractedDate.getTime())) {
      return null;
    }
    return extractedDate;
  } else if (extractedTime) {
    // Time only - assume today
    const result = new Date(now);
    result.setHours(extractedTime.hours, extractedTime.minutes, 0, 0);
    // Validate the date before returning
    if (isNaN(result.getTime())) {
      return null;
    }
    return result;
  }
  
  return null;
}

function extractTaskName(input: string): string {
  // Remove common date/time/assignee patterns to get clean task name
  const patternsToRemove = [
    /\b(?:by|to|for|assign(?:ed)?\s+to|give\s+to)\s+[A-Za-z]+(?:\s+[A-Za-z]+)*$/i,
    /\btomorrow\b/i,
    /\btoday\b/i,
    /\bnext\s+(?:week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\bthis\s+(?:week|month)\b/i,
    /\b\d{1,2}:?\d{0,2}\s*(?:am|pm)\b/i,
    /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i,
    /\b(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}(?:st|nd|rd|th)?\b/i,
    /\b\d{1,2}\/\d{1,2}\b/,
    /\bin\s+\d+\s+days?\b/i,
    /\bat\s+\d/i,
    /\bon\s+\d/i,
    /\bdue\s+/i,
    /\buntil\s+/i,
    /\bbefore\s+/i
  ];
  
  let cleanedInput = input;
  
  for (const pattern of patternsToRemove) {
    cleanedInput = cleanedInput.replace(pattern, '').trim();
  }
  
  // Clean up extra spaces and conjunctions
  cleanedInput = cleanedInput.replace(/\s+/g, ' ').replace(/^\s*(?:and|&)\s*/i, '').trim();
  
  return cleanedInput;
}