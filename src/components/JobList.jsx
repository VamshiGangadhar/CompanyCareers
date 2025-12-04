import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Search, LocationOn, Schedule, Business } from "@mui/icons-material";

const JobList = ({ jobs, filters, onFiltersChange, loading }) => {
  const [searchTerm, setSearchTerm] = useState(filters?.search || "");
  const [selectedLocation, setSelectedLocation] = useState(
    filters?.location || ""
  );
  const [selectedType, setSelectedType] = useState(filters?.type || "");

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onFiltersChange?.({
        search: searchTerm,
        location: selectedLocation,
        type: selectedType,
      });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedLocation, selectedType, onFiltersChange]);

  const locations = [
    ...new Set(jobs.map((job) => job.location).filter(Boolean)),
  ];
  const jobTypes = [...new Set(jobs.map((job) => job.type).filter(Boolean))];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-32 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Job Type Filter */}
          <div className="relative">
            <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
            >
              <option value="">All Types</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Job Results */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <div className="text-gray-400 text-lg mb-2">No jobs found</div>
            <div className="text-gray-500 text-sm">
              {searchTerm || selectedLocation || selectedType
                ? "Try adjusting your filters"
                : "No job openings at this time"}
            </div>
          </div>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>

      {/* Results count */}
      {jobs.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Showing {jobs.length} job{jobs.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

const JobCard = ({ job }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {job.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                {job.location}
              </div>
            )}
            {job.type && (
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                {job.type}
              </div>
            )}
          </div>
        </div>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          Apply Now
        </button>
      </div>

      {job.description && (
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
          {job.description}
        </p>
      )}
    </div>
  );
};

export default JobList;
