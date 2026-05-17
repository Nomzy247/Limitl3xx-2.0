
export const formatFirebaseDate = (timestamp: any, options: Intl.DateTimeFormatOptions = { 
  month: 'short', 
  day: 'numeric', 
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}) => {
  if (!timestamp) return 'Pending...';

  try {
    let date: Date;

    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp && timestamp.seconds !== undefined) {
      // Handle Firebase-like objects with seconds/nanoseconds
      const seconds = Number(timestamp.seconds);
      if (!isNaN(seconds)) {
        date = new Date(seconds * 1000);
      } else {
        date = new Date(NaN);
      }
    } else if (timestamp && (timestamp._seconds !== undefined || timestamp.seconds !== undefined)) {
      // Handle different variations of seconds field
      const s = timestamp._seconds || timestamp.seconds;
      date = new Date(Number(s) * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      // Fallback for objects that might be raw snapshots but not recognized
      date = new Date(NaN);
    }

    if (!date || isNaN(date.getTime())) {
      // If we still don't have a valid date, check if it's a Firestore Timestamp-like object missing toDate
      if (timestamp && typeof timestamp === 'object') {
        if (timestamp.hasOwnProperty('seconds')) return new Date(timestamp.seconds * 1000).toLocaleString('en-US', options);
        if (timestamp.hasOwnProperty('_seconds')) return new Date(timestamp._seconds * 1000).toLocaleString('en-US', options);
        if (timestamp.timestamp && typeof timestamp.timestamp === 'object') {
          if (timestamp.timestamp.seconds) return new Date(timestamp.timestamp.seconds * 1000).toLocaleString('en-US', options);
          if (timestamp.timestamp._seconds) return new Date(timestamp.timestamp._seconds * 1000).toLocaleString('en-US', options);
        }
      }
      return 'Pending...';
    }

    // Use toLocaleString to ensure both date and time components are respected
    return date.toLocaleString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Pending...';
  }
};
