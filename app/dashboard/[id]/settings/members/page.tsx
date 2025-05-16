'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, MoreHorizontal } from 'lucide-react';
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import './_components/members.scss';

// Mock data - you'll replace this with actual data fetching
const MOCK_MEMBERS = [
  {
    name: 'Seekerbone',
    avatar: 'https://via.placeholder.com/40',
    memberSince: '8 days ago',
    joinedDart: '2 years ago',
    joinMethod: 'XjnxF3XX',
    roles: ['Streamer'],
    signals: '+6'
  },
  {
    name: 'Drowski',
    avatar: 'https://via.placeholder.com/40',
    memberSince: '27 days ago',
    joinedDart: '1 year ago',
    joinMethod: 'AJRDq3P',
    roles: ['member'],
    signals: ''
  },
  // Add more mock members...
];

export default function MembersPage() {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMemberSelection = (name: string) => {
    setSelectedMembers(prev => 
      prev.includes(name) 
        ? prev.filter(member => member !== name)
        : [...prev, name]
    );
  };

  const filteredMembers = MOCK_MEMBERS.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ShowcaseSection title="Members Management">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search by username or id"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-2 dark:bg-gray-dark text-dark dark:text-white border-stroke dark:border-dark-3"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-4 dark:text-dark-6" size={20} />
        </div>
        <div className="flex space-x-4">
          <button className="flex items-center gap-2 rounded-lg px-4 py-2 bg-gray-2 dark:bg-gray-dark text-dark dark:text-white border border-stroke dark:border-dark-3 hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors">
            Sort <ChevronDown size={16} />
          </button>
          <button className="rounded-lg px-4 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors">
            Prune
          </button>
        </div>
      </div>

      <div className="overflow-x-auto members-table">
        <table className="w-full text-sm">
          <thead className="bg-gray-2 dark:bg-gray-dark border-b border-stroke dark:border-dark-3">
            <tr>
              <th className="p-3 text-left">
                <input 
                  type="checkbox" 
                  className="form-checkbox rounded text-primary dark:text-primary-light"
                />
              </th>
              <th className="p-3 text-left text-dark-4 dark:text-dark-6 uppercase">NAME</th>
              <th className="p-3 text-left text-dark-4 dark:text-dark-6 uppercase">MEMBER SINCE</th>
              <th className="p-3 text-left text-dark-4 dark:text-dark-6 uppercase">JOINED DART</th>
              <th className="p-3 text-left text-dark-4 dark:text-dark-6 uppercase">JOIN METHOD</th>
              <th className="p-3 text-left text-dark-4 dark:text-dark-6 uppercase">ROLES</th>
              <th className="p-3 text-left text-dark-4 dark:text-dark-6 uppercase">SIGNALS</th>
              <th className="p-3 text-right text-dark-4 dark:text-dark-6 uppercase">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr 
                key={member.name} 
                className="border-b border-stroke dark:border-dark-3 hover:bg-gray-2 dark:hover:bg-gray-dark transition-colors"
              >
                <td className="p-3">
                  <input 
                    type="checkbox" 
                    checked={selectedMembers.includes(member.name)}
                    onChange={() => toggleMemberSelection(member.name)}
                    className="form-checkbox rounded text-primary dark:text-primary-light"
                  />
                </td>
                <td className="p-3 flex items-center space-x-3">
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium text-dark dark:text-white">{member.name}</span>
                </td>
                <td className="p-3 text-dark-4 dark:text-dark-5">{member.memberSince}</td>
                <td className="p-3 text-dark-4 dark:text-dark-5">{member.joinedDart}</td>
                <td className="p-3 text-dark-4 dark:text-dark-5">{member.joinMethod}</td>
                <td className="p-3">
                  {member.roles.map(role => (
                    <span 
                      key={role} 
                      className="bg-gray-2 dark:bg-gray-dark text-dark-4 dark:text-dark-5 px-2 py-1 rounded-full text-xs mr-2"
                    >
                      {role}
                    </span>
                  ))}
                </td>
                <td className="p-3 text-dark-4 dark:text-dark-5">{member.signals}</td>
                <td className="p-3 text-right">
                  <button className="text-dark-4 dark:text-dark-5 hover:bg-gray-2 dark:hover:bg-gray-dark p-2 rounded transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <span className="text-dark-4 dark:text-dark-5">
          Showing 12 members of 60
        </span>
        <div className="flex space-x-2 pagination">
          <button className="px-4 py-2 bg-gray-2 dark:bg-gray-dark text-dark dark:text-white rounded page-btn">
            Back
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded active-page">1</button>
          <button className="px-4 py-2 bg-gray-2 dark:bg-gray-dark text-dark dark:text-white rounded page-btn">2</button>
          <button className="px-4 py-2 bg-gray-2 dark:bg-gray-dark text-dark dark:text-white rounded page-btn">3</button>
          <button className="px-4 py-2 bg-gray-2 dark:bg-gray-dark text-dark dark:text-white rounded page-btn">4</button>
          <button className="px-4 py-2 bg-gray-2 dark:bg-gray-dark text-dark dark:text-white rounded page-btn">5</button>
          <button className="px-4 py-2 bg-gray-2 dark:bg-gray-dark text-dark dark:text-white rounded page-btn">
            Next
          </button>
        </div>
      </div>
    </ShowcaseSection>
  );
}