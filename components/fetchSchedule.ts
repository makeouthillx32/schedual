export const fetchSchedule = async (week: number, day: string) => {
    try {
      const response = await fetch(`/api/schedule?week=${week}&day=${day}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching schedule:", error);
      throw error;
    }
  };
  