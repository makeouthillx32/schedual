'use client';

import { useState } from 'react';
import { Search, MoreHorizontal, ChevronRight } from 'lucide-react';
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import './_components/roles.scss';

// Mock roles data
const MOCK_ROLES = [
  { 
    name: 'Unenter', 
    color: '#ff0000', // Red
    memberCount: 2,
    icon: '🚫'
  },
  { 
    name: 'Enter', 
    color: '#0000ff', // Blue
    memberCount: 3,
    icon: '🚪'
  },
  { 
    name: 'Moderators', 
    color: '#0000ff', // Blue
    memberCount: 2,
    icon: '🛡️'
  },
  { 
    name: 'Streamer', 
    color: '#800080', // Purple
    memberCount: 19,
    icon: '📺'
  },
  { 
    name: 'Loyals', 
    color: '#ff0000', // Red
    memberCount: 10,
    icon: '❤️'
  },
  { 
    name: 'Kick', 
    color: '#00ff00', // Green
    memberCount: 28,
    icon: '👟'
  },
  { 
    name: 'Youtube', 
    color: '#ff0000', // Red
    memberCount: 8,
    icon: '🎥'
  },
  { 
    name: 'Member', 
    color: '#0000ff', // Blue
    memberCount: 39,
    icon: '👥'
  },
  { 
    name: 'Utility Bots', 
    color: '#0000ff', // Blue
    memberCount: 0,
    icon: '🤖'
  },
  { 
    name: 'Fun Bots', 
    color: '#00ff00', // Green
    memberCount: 0,
    icon: '🎉'
  }
];

export default function RolesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter roles based on search query
  const filteredRoles = MOCK_ROLES.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ShowcaseSection title="Roles Management">
      <div className="roles-page">
        {/* Default Permissions Section */}
        <div 
          className="flex items-center justify-between bg-gray-2 dark:bg-gray-dark border border-stroke dark:border-dark-3 rounded-lg p-4 mb-6 default-permissions cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <div>
              <h3 className="font-semibold text-dark dark:text-white">Default Permissions</h3>
              <p className="text-sm text-dark-4 dark:text-dark-5">@everyone • applies to all server members</p>
            </div>
          </div>
          <ChevronRight className="text-dark-4 dark:text-dark-5" />
        </div>

        {/* Search and Create Role Section */}
        <div className="roles-header">
          <div className="search-input flex-grow max-w-md relative mr-4">
            <Search className="search-icon absolute left-3 top-1/2 transform -translate-y-1/2" size={20} />
            <input 
              type="text"
              placeholder="Search Roles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-2 dark:bg-gray-dark text-dark dark:text-white border-stroke dark:border-dark-3"
            />
          </div>
          <button className="create-role-btn px-4 py-2 rounded-lg">
            Create Role
          </button>
        </div>

        {/* Roles Description */}
        <p className="text-dark-4 dark:text-dark-5 mb-4">
          Members use the color of the highest role they have on this list. Drag roles to reorder them.
          <a href="#" className="text-primary ml-2 hover:underline">Need help with permissions?</a>
        </p>

        {/* Roles List */}
        <div className="bg-white dark:bg-gray-dark border border-stroke dark:border-dark-3 rounded-lg">
          <div className="grid grid-cols-12 p-4 bg-gray-2 dark:bg-gray-800 text-dark-4 dark:text-dark-5 uppercase text-xs">
            <div className="col-span-6">ROLES - {filteredRoles.length}</div>
            <div className="col-span-6 text-right">MEMBERS</div>
          </div>

          {filteredRoles.map((role) => (
            <div 
              key={role.name} 
              className="role-item flex items-center justify-between p-4 border-b border-stroke dark:border-dark-3 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <span 
                  className="role-color" 
                  style={{ backgroundColor: role.color }}
                />
                <span className="mr-2">{role.icon}</span>
                <span className="font-medium text-dark dark:text-white">{role.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-dark-4 dark:text-dark-5">{role.memberCount} 👥</span>
                <button className="role-actions text-dark-4 dark:text-dark-5 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ShowcaseSection>
  );
}