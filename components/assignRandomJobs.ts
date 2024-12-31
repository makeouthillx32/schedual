import { members } from "../lib/members";

export const assignRandomJobs = (jobs: string[], availableMembers: typeof members) => {
  const shuffledMembers = [...availableMembers].sort(() => Math.random() - 0.5);
  const assignedJobs: { job_name: string; member_name: string }[] = [];

  let memberIndex = 0; // Ensure all members are used at least once
  jobs.forEach((job) => {
    const assignedMember = shuffledMembers[memberIndex];
    assignedJobs.push({ job_name: job, member_name: assignedMember.name });
    memberIndex = (memberIndex + 1) % shuffledMembers.length; // Wrap around
  });

  return assignedJobs;
};
