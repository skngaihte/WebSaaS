import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [chartImage, setChartImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:8000/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(res.data);
      setChartImage(`data:image/png;base64,${res.data.chart_image}`);

      // Trigger download of analyzed Excel file
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${res.data.output_file}`;
      link.download = 'analyzed_output.xlsx';
      link.click();

    } catch (err) {
      alert('Error uploading file: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h2>📊 Excel Analyzer WebSaaS</h2>
      <p>Upload an Excel (.xlsx) or CSV (.csv) file below:</p>

      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
        <br /><br />
        <button type="submit">🚀 Analyze File</button>
      </form>

      {result && (
        <div style={{ marginTop: '30px' }}>
          <h3>📈 Data Summary:</h3>
          <pre>{JSON.stringify(result.summary, null, 2)}</pre>
        </div>
      )}

      {chartImage && (
        <div style={{ marginTop: '30px' }}>
          <h3>📊 Generated Chart:</h3>
          <img src={chartImage} alt="Generated Chart" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
}

export default App;