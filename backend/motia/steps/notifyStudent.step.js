export default async function notifyStudent({ input }) {
  const { student, riskLevel, riskReasons } = input;

  // In production, this would send email/SMS/push notification
  // For now, we log it (the frontend will show real-time alerts)
  
  if (riskLevel === 'Medium' || riskLevel === 'High') {
    const notification = {
      studentId: student._id,
      studentName: student.name,
      type: 'risk_alert',
      riskLevel,
      message: `Your engagement level requires attention. ${riskReasons.join(', ')}`,
      recommendations: getRecommendations(riskReasons),
      timestamp: new Date(),
    };


    return {
      ...input,
      studentNotification: notification,
    };
  }


  return {
    ...input,
    studentNotification: null,
  };
}

function getRecommendations(riskReasons) {
  const recommendations = [];
  
  if (riskReasons.some(r => r.includes('absence'))) {
    recommendations.push('Attend classes regularly');
    recommendations.push('Contact your mentor if facing difficulties');
  }
  
  if (riskReasons.some(r => r.includes('assignment'))) {
    recommendations.push('Submit pending assignments');
    recommendations.push('Seek help from peers or instructors');
  }
  
  if (riskReasons.some(r => r.includes('performance'))) {
    recommendations.push('Review study materials');
    recommendations.push('Consider tutoring or study groups');
  }
  
  return recommendations;
}







