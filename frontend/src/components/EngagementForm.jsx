import React, { useState } from 'react';

const EngagementForm = ({ onSubmit, loading }) => {
  const [eventType, setEventType] = useState('attendance');
  const [formData, setFormData] = useState({
    status: 'present',
    submitted: true,
    assignmentName: '',
    score: '',
    testName: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let eventData = {};
    
    if (eventType === 'attendance') {
      eventData = { status: formData.status };
    } else if (eventType === 'assignment') {
      eventData = {
        submitted: formData.submitted,
        assignmentName: formData.assignmentName,
      };
    } else if (eventType === 'performance') {
      eventData = {
        score: parseFloat(formData.score),
        testName: formData.testName,
      };
    }
    
    onSubmit({ eventType, eventData });
    
    // Reset form
    setFormData({
      status: 'present',
      submitted: true,
      assignmentName: '',
      score: '',
      testName: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="text-lg font-semibold mb-4">Submit Engagement Event</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Type
        </label>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="input-field"
        >
          <option value="attendance">Attendance</option>
          <option value="assignment">Assignment</option>
          <option value="performance">Performance/Test</option>
        </select>
      </div>

      {eventType === 'attendance' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="input-field"
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      )}

      {eventType === 'assignment' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Name
            </label>
            <input
              type="text"
              value={formData.assignmentName}
              onChange={(e) => setFormData({ ...formData, assignmentName: e.target.value })}
              className="input-field"
              placeholder="e.g., Math Homework 5"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.submitted}
              onChange={(e) => setFormData({ ...formData, submitted: e.target.value === 'true' })}
              className="input-field"
            >
              <option value="true">Submitted</option>
              <option value="false">Missed</option>
            </select>
          </div>
        </>
      )}

      {eventType === 'performance' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Name
            </label>
            <input
              type="text"
              value={formData.testName}
              onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
              className="input-field"
              placeholder="e.g., Midterm Exam"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Score (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: e.target.value })}
              className="input-field"
              placeholder="e.g., 85"
              required
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit Event'}
      </button>
    </form>
  );
};

export default EngagementForm;







