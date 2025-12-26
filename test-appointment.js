import fetch from "node-fetch";

const newAppointment = {
  appointmentdate: "2025-12-05 14:00:00",
  companyid: "test-company",
  contractorid: "contractor-1",
  childname: "Teste Cria��o",
  createdat: new Date().toISOString(),
};

async function testCreate() {
  try {
    const response = await fetch("http://localhost:3000/api/clinic/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAppointment),
    });
    
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testCreate();
