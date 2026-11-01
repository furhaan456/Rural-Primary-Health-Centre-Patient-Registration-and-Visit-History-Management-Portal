// Reports controller generating aggregated metrics and analytics for PHC Portal with MongoDB Atlas support
const { getIsConnected, Patient, Visit, User, Village, memoryDb } = require('../config/db');

// Get overall PHC dashboard statistics and village breakdown
const getOverviewStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    let totalPatients = 0;
    let visitsToday = 0;
    let totalVisits = 0;
    let totalDoctors = 0;
    let villageDistribution = [];

    if (getIsConnected()) {
      totalPatients = await Patient.countDocuments();
      visitsToday = await Visit.countDocuments({ visit_date: todayStr });
      totalVisits = await Visit.countDocuments();
      totalDoctors = await User.countDocuments({ role: 'doctor' });

      const villages = await Village.find({}).lean();
      const patients = await Patient.find({}).lean();

      villageDistribution = villages.map(v => {
        const count = patients.filter(p => p.village_id === v.id).length;
        return {
          village_name: v.name,
          patient_count: count
        };
      });
    } else {
      totalPatients = memoryDb.patients.length;
      visitsToday = memoryDb.visits.filter(v => v.visit_date === todayStr).length;
      totalVisits = memoryDb.visits.length;
      totalDoctors = memoryDb.users.filter(u => u.role === 'doctor').length;

      villageDistribution = memoryDb.villages.map(v => {
        const count = memoryDb.patients.filter(p => p.village_id === v.id).length;
        return {
          village_name: v.name,
          patient_count: count
        };
      });
    }

    // Calculate real weekly OPD visit trend (Monday through Sunday of the current week)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMon = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMon);

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const visitTrend = [];

    let allVisits = [];
    if (getIsConnected()) {
      allVisits = await Visit.find({}).lean();
    } else {
      allVisits = memoryDb.visits;
    }

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const count = allVisits.filter(v => {
        if (v.visit_date === dateStr) return true;
        if (v.created_at && v.created_at.startsWith(dateStr)) return true;
        if (v.createdAt) {
          const cDate = new Date(v.createdAt).toISOString().split('T')[0];
          if (cDate === dateStr) return true;
        }
        return false;
      }).length;

      visitTrend.push({
        day: dayLabels[i],
        date: dateStr,
        visits: count
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        visitsToday,
        totalVisits,
        totalDoctors
      },
      villageDistribution,
      visitTrend
    });
  } catch (error) {
    console.error('Get Overview Stats Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate analytics reports.' });
  }
};

module.exports = { getOverviewStats };
