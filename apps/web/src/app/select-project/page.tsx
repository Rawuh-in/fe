'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '@event-organizer/services';
import { useEffect, useState } from 'react';

export default function SelectProject() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, currentUser, isSystemAdmin } = useAuth();
  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  // Load previously selected project
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProjectId = localStorage.getItem('selectedProjectId');
      if (savedProjectId) {
        setSelectedProject(parseInt(savedProjectId, 10));
      }
    }
  }, []);

  const handleProjectSelect = (projectId: number) => {
    setSelectedProject(projectId);
  };

  const handleContinue = () => {
    if (selectedProject) {
      localStorage.setItem('selectedProjectId', selectedProject.toString());
      router.push('/');
    }
  };

  // Show loading while checking authentication
  if (authLoading || projectsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Get projects list
  const projects = projectsData?.Data || projectsData?.data || [];

  // Filter projects based on user role
  const availableProjects = isSystemAdmin
    ? projects // SYSTEM_ADMIN sees all projects
    : projects.filter((project) => project.ID === currentUser?.project_id); // Regular users see only their project

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Event Organizer</h1>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{currentUser?.name}</span>
              {isSystemAdmin && (
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  System Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Project</h2>
          <p className="text-gray-600 mb-6">
            {isSystemAdmin
              ? 'Choose which project you want to work with'
              : 'Select your project to continue'}
          </p>

          {availableProjects.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please contact your administrator to be assigned to a project.
              </p>
            </div>
          ) : (
            <>
              {/* Project List */}
              <div className="space-y-3 mb-6">
                {availableProjects.map((project) => (
                  <button
                    key={project.ID}
                    onClick={() => handleProjectSelect(project.ID)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedProject === project.ID
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{project.ProjectName}</h3>
                        {project.Description && (
                          <p className="text-sm text-gray-600 mt-1">{project.Description}</p>
                        )}
                      </div>
                      {selectedProject === project.ID && (
                        <svg
                          className="h-6 w-6 text-blue-500 flex-shrink-0 ml-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!selectedProject}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedProject
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue to Dashboard
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
