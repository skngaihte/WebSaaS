import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [chartImage, setChartImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('https://excel-analyzer.onrender.com/analyze',  formData, {
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📊 Excel Analyzer WebSaaS</h2>
        <p style={styles.subtitle}>Upload an Excel (.xlsx) or CSV (.csv) file below:</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
            style={styles.fileInput}
          />
          <button type="submit" disabled={isLoading} style={styles.submitButton}>
            {isLoading ? "Analyzing..." : "🚀 Analyze File"}
          </button>
        </form>

        {result && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📈 Data Summary:</h3>
            <pre style={styles.summaryBox}>
              {JSON.stringify(result.summary, null, 2)}
            </pre>
          </div>
        )}

        {chartImage && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📊 Generated Chart:</h3>
            <img src={chartImage} alt="Generated Chart" style={styles.chartImage} />
          </div>
        )}
      </div>

      {/* Chat Box */}
      <div style={styles.chatBoxContainer}>
        <h3 style={styles.chatTitle}>🤖 Ask Me Anything About Your Data</h3>
        <textarea
          placeholder="E.g., 'Show me sales trends by region' or 'Visualize monthly revenue'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.textArea}
        />
        <button style={styles.chatButton}>🧠 Analyze with AI</button>
      </div>
    </div>
  );
}

// 💅 Styles Object (no CSS file needed)
const styles = {
  container: {
    padding: '40px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1000px',
    margin: 'auto',
    backgroundColor: '#f9f9f9',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '30px',
    marginBottom: '40px',
  },
  title: {
    margin: '0 0 10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  fileInput: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '16px',
  },
  submitButton: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  section: {
    marginTop: '30px',
  },
  sectionTitle: {
    fontSize: '20px',
    marginBottom: '10px',
  },
  summaryBox: {
    background: '#f4f4f4',
    padding: '15px',
    borderRadius: '5px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
  chartImage: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '5px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  chatBoxContainer: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '30px',
  },
  chatTitle: {
    margin: '0 0 15px',
  },
  textArea: {
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    marginBottom: '15px',
    resize: 'vertical',
  },
  chatButton: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default App;