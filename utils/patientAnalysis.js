const Patient = require("../models/patients");


async function analyzePatientRecords() {
  try {
    const patients = await Patient.find();
    
    // Helper function to calculate age
    const calculateAge = (birthDate) => {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    // Group patients by diagnosis and age range
    const groupedPatients = patients.reduce((acc, patient) => {
      const age = calculateAge(patient.dateOfBirth);
      const ageRange = Math.floor(age / 10) * 10; // Group into decades
      const key = `${patient.diagnosis}_${ageRange}`;
      
      if (!acc[key]) {
        acc[key] = {
          diagnosis: patient.diagnosis,
          ageRange: `${ageRange}-${ageRange + 9}`,
          count: 0,
          totalExpenses: 0,
          admittedCount: 0,
          dischargedCount: 0
        };
      }
      
      acc[key].count++;
      acc[key].totalExpenses += patient.expenses;
      if (patient.status === 'Admitted') {
        acc[key].admittedCount++;
      } else {
        acc[key].dischargedCount++;
      }
      
      return acc;
    }, {});

    // Generate report
    const report = {
      totalPatients: patients.length,
      groupedData: Object.values(groupedPatients).map(group => ({
        ...group,
        averageExpenses: group.totalExpenses / group.count
      })),
      topDiagnoses: Object.values(groupedPatients)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(group => ({
          diagnosis: group.diagnosis,
          count: group.count
        })),
      overallStatistics: {
        totalExpenses: patients.reduce((sum, patient) => sum + patient.expenses, 0),
        averageExpenses: patients.reduce((sum, patient) => sum + patient.expenses, 0) / patients.length,
        admittedCount: patients.filter(patient => patient.status === 'Admitted').length,
        dischargedCount: patients.filter(patient => patient.status === 'Discharged').length
      }
    };


    return report;
  } catch (error) {
    console.error('Error analyzing patient records:', error);
    throw error;
  }
}

module.exports = analyzePatientRecords;