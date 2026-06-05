import ClawMachineDailyReport from './ClawMachineDailyReport';
import './App.css';

function App() {
  useEffect(() => {
  const saved = localStorage.getItem("claw_machine_data");

  if (saved) {
    const data = JSON.parse(saved);

    if (data.rows) setRows(data.rows);
    if (data.date) setDate(data.date);
    if (data.staffName) setStaffName(data.staffName);
    if (data.manager) setManager(data.manager);
  }
}, []);
  useEffect(() => {
  localStorage.setItem(
    "claw_machine_data",
    JSON.stringify({
      rows,
      date,
      staffName,
      manager,
    })
  );
}, [rows, date, staffName, manager]);
  <button
  onClick={() => {
    localStorage.removeItem("claw_machine_data");
    window.location.reload();
  }}
>
  Clear All Data
</button>
  
  return <ClawMachineDailyReport />;
}

export default App;
