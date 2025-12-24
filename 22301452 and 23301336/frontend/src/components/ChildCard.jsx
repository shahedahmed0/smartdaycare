import React from 'react';

const ChildCard = ({ child, onView }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{child.name}</h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-semibold mr-2">Age:</span>
              <span>{child.age} years old</span>
            </div>
            
            <div className="flex items-center">
              <span className="font-semibold mr-2">Gender:</span>
              <span className="capitalize">{child.gender}</span>
            </div>
            
            <div className="flex items-center">
              <span className="font-semibold mr-2">DOB:</span>
              <span>{formatDate(child.dateOfBirth)}</span>
            </div>

            {child.allergies && child.allergies.length > 0 && (
              <div className="flex items-start">
                <span className="font-semibold mr-2">Allergies:</span>
                <div className="flex flex-wrap gap-1">
                  {child.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center">
              <span className="font-semibold mr-2">Status:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                child.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {child.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="ml-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-3xl text-blue-600">
              {child.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => onView(child)}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          View Full Profile
        </button>
      </div>
    </div>
  );
};

export default ChildCard;